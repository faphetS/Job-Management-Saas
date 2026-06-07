-- 0006 — Row Level Security: deny-by-default, then whitelist per role.
-- Roles read via public.current_org_id() / public.current_user_role().
-- service_role (server) bypasses all of this; these target `authenticated`.

-- table privileges (RLS still gates rows). anon needs none — all app data
-- access happens after login as the `authenticated` role.
grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage on all sequences in schema public to authenticated;

alter table public.organizations      enable row level security;
alter table public.profiles           enable row level security;
alter table public.customers          enable row level security;
alter table public.jobs               enable row level security;
alter table public.quotes             enable row level security;
alter table public.quote_line_items   enable row level security;
alter table public.invoices           enable row level security;
alter table public.invoice_line_items enable row level security;
alter table public.payments           enable row level security;

-- ============================ organizations ============================
drop policy if exists orgs_select on public.organizations;
create policy orgs_select on public.organizations for select to authenticated
  using (id = public.current_org_id());

drop policy if exists orgs_update on public.organizations;
create policy orgs_update on public.organizations for update to authenticated
  using (id = public.current_org_id() and public.current_user_role() = 'owner')
  with check (id = public.current_org_id() and public.current_user_role() = 'owner');
-- INSERT happens only via create_organization() (SECURITY DEFINER).

-- ============================ profiles ============================
-- self always; staff may read everyone in their org (needed to assign jobs).
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select to authenticated
  using (
    id = auth.uid()
    or (org_id = public.current_org_id() and public.current_user_role() in ('owner','employee'))
  );

-- only owners manage profiles (role/org changes). prevents privilege escalation.
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update to authenticated
  using (org_id = public.current_org_id() and public.current_user_role() = 'owner')
  with check (org_id = public.current_org_id() and public.current_user_role() = 'owner');
-- INSERT happens only via handle_new_user() (SECURITY DEFINER).

-- ============================ customers ============================
drop policy if exists customers_select on public.customers;
create policy customers_select on public.customers for select to authenticated
  using (
    org_id = public.current_org_id() and (
      public.current_user_role() in ('owner','employee')
      or profile_id = auth.uid()
    )
  );

drop policy if exists customers_insert on public.customers;
create policy customers_insert on public.customers for insert to authenticated
  with check (
    org_id = public.current_org_id() and (
      public.current_user_role() in ('owner','employee')
      or (public.current_user_role() = 'client' and profile_id = auth.uid())
    )
  );

drop policy if exists customers_update on public.customers;
create policy customers_update on public.customers for update to authenticated
  using (
    org_id = public.current_org_id() and (
      public.current_user_role() in ('owner','employee') or profile_id = auth.uid()
    )
  )
  with check (
    org_id = public.current_org_id() and (
      public.current_user_role() in ('owner','employee') or profile_id = auth.uid()
    )
  );

drop policy if exists customers_delete on public.customers;
create policy customers_delete on public.customers for delete to authenticated
  using (org_id = public.current_org_id() and public.current_user_role() = 'owner');

-- ============================ jobs ============================
drop policy if exists jobs_select on public.jobs;
create policy jobs_select on public.jobs for select to authenticated
  using (
    org_id = public.current_org_id() and (
      public.current_user_role() = 'owner'
      or (public.current_user_role() = 'employee' and assigned_to = auth.uid())
      or (public.current_user_role() = 'client'
          and customer_id in (select id from public.customers where profile_id = auth.uid()))
    )
  );

drop policy if exists jobs_insert on public.jobs;
create policy jobs_insert on public.jobs for insert to authenticated
  with check (
    org_id = public.current_org_id() and (
      public.current_user_role() in ('owner','employee')
      or (public.current_user_role() = 'client'
          and status = 'requested'
          and customer_id in (select id from public.customers where profile_id = auth.uid()))
    )
  );

drop policy if exists jobs_update on public.jobs;
create policy jobs_update on public.jobs for update to authenticated
  using (
    org_id = public.current_org_id() and (
      public.current_user_role() = 'owner'
      or (public.current_user_role() = 'employee' and assigned_to = auth.uid())
    )
  )
  with check (
    org_id = public.current_org_id() and (
      public.current_user_role() = 'owner'
      or (public.current_user_role() = 'employee' and assigned_to = auth.uid())
    )
  );

drop policy if exists jobs_delete on public.jobs;
create policy jobs_delete on public.jobs for delete to authenticated
  using (org_id = public.current_org_id() and public.current_user_role() = 'owner');

-- ============================ quotes ============================
drop policy if exists quotes_select on public.quotes;
create policy quotes_select on public.quotes for select to authenticated
  using (
    org_id = public.current_org_id() and (
      public.current_user_role() = 'owner'
      or (public.current_user_role() = 'client'
          and customer_id in (select id from public.customers where profile_id = auth.uid()))
    )
  );

drop policy if exists quotes_write on public.quotes;
create policy quotes_write on public.quotes for all to authenticated
  using (org_id = public.current_org_id() and public.current_user_role() = 'owner')
  with check (org_id = public.current_org_id() and public.current_user_role() = 'owner');
-- clients change status only via respond_to_quote() (SECURITY DEFINER).

-- ===================== quote_line_items =====================
drop policy if exists qli_owner_all on public.quote_line_items;
create policy qli_owner_all on public.quote_line_items for all to authenticated
  using (org_id = public.current_org_id() and public.current_user_role() = 'owner')
  with check (org_id = public.current_org_id() and public.current_user_role() = 'owner');

drop policy if exists qli_client_select on public.quote_line_items;
create policy qli_client_select on public.quote_line_items for select to authenticated
  using (
    org_id = public.current_org_id()
    and public.current_user_role() = 'client'
    and exists (
      select 1 from public.quotes q
      where q.id = quote_id
        and q.customer_id in (select id from public.customers where profile_id = auth.uid())
    )
  );

-- ============================ invoices ============================
drop policy if exists invoices_select on public.invoices;
create policy invoices_select on public.invoices for select to authenticated
  using (
    org_id = public.current_org_id() and (
      public.current_user_role() = 'owner'
      or (public.current_user_role() = 'client'
          and customer_id in (select id from public.customers where profile_id = auth.uid()))
    )
  );

drop policy if exists invoices_write on public.invoices;
create policy invoices_write on public.invoices for all to authenticated
  using (org_id = public.current_org_id() and public.current_user_role() = 'owner')
  with check (org_id = public.current_org_id() and public.current_user_role() = 'owner');
-- clients pay via pay_invoice() (SECURITY DEFINER); no direct write.

-- ===================== invoice_line_items =====================
drop policy if exists ili_owner_all on public.invoice_line_items;
create policy ili_owner_all on public.invoice_line_items for all to authenticated
  using (org_id = public.current_org_id() and public.current_user_role() = 'owner')
  with check (org_id = public.current_org_id() and public.current_user_role() = 'owner');

drop policy if exists ili_client_select on public.invoice_line_items;
create policy ili_client_select on public.invoice_line_items for select to authenticated
  using (
    org_id = public.current_org_id()
    and public.current_user_role() = 'client'
    and exists (
      select 1 from public.invoices i
      where i.id = invoice_id
        and i.customer_id in (select id from public.customers where profile_id = auth.uid())
    )
  );

-- ============================ payments ============================
-- read only; inserts happen via pay_invoice() (SECURITY DEFINER).
drop policy if exists payments_select on public.payments;
create policy payments_select on public.payments for select to authenticated
  using (
    org_id = public.current_org_id() and (
      public.current_user_role() = 'owner'
      or exists (
        select 1 from public.invoices i
        where i.id = invoice_id
          and i.customer_id in (select id from public.customers where profile_id = auth.uid())
      )
    )
  );
