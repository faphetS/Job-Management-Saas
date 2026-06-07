-- 0005 — auth glue: claim accessors, new-user trigger, and the RPCs the
-- client calls for privileged-but-scoped actions.
--
-- DESIGN NOTE: current_org_id()/current_user_role() are SECURITY DEFINER and
-- read public.profiles directly. Because they are owned by `postgres` (the
-- table owner), they BYPASS RLS on profiles, so calling them from inside a
-- profiles RLS policy does NOT recurse. This avoids needing a Custom Access
-- Token Hook and means role/org changes take effect immediately (no token
-- refresh required).

-- ---------- claim accessors ----------
create or replace function public.current_org_id()
returns uuid
language sql stable security definer set search_path = ''
as $$
  select org_id from public.profiles where id = auth.uid();
$$;

create or replace function public.current_user_role()
returns public.user_role
language sql stable security definer set search_path = ''
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- ---------- new user -> profile ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, org_id, role, full_name, phone)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'org_id', '')::uuid,
    coalesce(nullif(new.raw_user_meta_data ->> 'role', ''), 'client')::public.user_role,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone'
  );
  return new;
end; $$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- owner onboarding: create an org and become its owner ----------
create or replace function public.create_organization(
  org_name    text,
  owner_name  text default null,
  owner_phone text default null
)
returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  new_org_id uuid;
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  if exists (select 1 from public.profiles where id = uid and org_id is not null) then
    raise exception 'You already belong to an organization';
  end if;

  insert into public.organizations (name) values (org_name) returning id into new_org_id;

  update public.profiles
    set org_id    = new_org_id,
        role      = 'owner',
        full_name = coalesce(owner_name, full_name),
        phone     = coalesce(owner_phone, phone)
  where id = uid;

  return new_org_id;
end; $$;

-- ---------- client approves/declines a quote (status flip only) ----------
create or replace function public.respond_to_quote(p_quote_id uuid, p_approve boolean)
returns void
language plpgsql security definer set search_path = ''
as $$
declare uid uuid := auth.uid();
begin
  update public.quotes q
    set status = case when p_approve
                      then 'approved'::public.quote_status
                      else 'declined'::public.quote_status end
  where q.id = p_quote_id
    and q.status = 'sent'
    and q.customer_id in (select id from public.customers where profile_id = uid);

  if not found then
    raise exception 'Quote not found or not actionable';
  end if;
end; $$;

-- ---------- mock payment: pay the full remaining balance of an invoice ----------
create or replace function public.pay_invoice(p_invoice_id uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  inv public.invoices%rowtype;
begin
  select * into inv from public.invoices where id = p_invoice_id;
  if not found then raise exception 'Invoice not found'; end if;

  if not (
    inv.customer_id in (select id from public.customers where profile_id = uid)
    or exists (
      select 1 from public.profiles p
      where p.id = uid and p.org_id = inv.org_id and p.role in ('owner','employee')
    )
  ) then
    raise exception 'Not allowed to pay this invoice';
  end if;

  if inv.status = 'paid' then raise exception 'Invoice already paid'; end if;

  insert into public.payments (org_id, invoice_id, amount, method, created_by)
  values (inv.org_id, inv.id, greatest(inv.total - inv.amount_paid, 0), 'mock', uid);
  -- trg_apply_payment updates amount_paid + status
end; $$;

-- callable by logged-in users (row-level checks live inside each function)
grant execute on function public.current_org_id()                      to authenticated;
grant execute on function public.current_user_role()                   to authenticated;
grant execute on function public.create_organization(text, text, text) to authenticated;
grant execute on function public.respond_to_quote(uuid, boolean)       to authenticated;
grant execute on function public.pay_invoice(uuid)                     to authenticated;
