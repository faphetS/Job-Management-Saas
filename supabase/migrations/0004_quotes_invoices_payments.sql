-- 0004 — quotes, invoices, their line items, and payments
-- All money is stored as integer CENTS.

-- ---------- quotes ----------
create table if not exists public.quotes (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations(id) on delete cascade,
  job_id      uuid references public.jobs(id) on delete set null,
  customer_id uuid not null references public.customers(id) on delete cascade,
  status      public.quote_status not null default 'draft',
  subtotal    integer not null default 0,
  tax         integer not null default 0,
  total       integer not null default 0,
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists idx_quotes_org      on public.quotes(org_id);
create index if not exists idx_quotes_customer on public.quotes(customer_id);
create or replace trigger trg_quotes_updated
  before update on public.quotes for each row execute function public.set_updated_at();

create table if not exists public.quote_line_items (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations(id) on delete cascade,
  quote_id    uuid not null references public.quotes(id) on delete cascade,
  description text not null,
  quantity    numeric(10,2) not null default 1,
  unit_price  integer not null default 0,
  line_total  integer not null default 0
);
create index if not exists idx_qli_quote on public.quote_line_items(quote_id);
create index if not exists idx_qli_org   on public.quote_line_items(org_id);

-- ---------- invoices ----------
create table if not exists public.invoices (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations(id) on delete cascade,
  job_id      uuid references public.jobs(id) on delete set null,
  quote_id    uuid references public.quotes(id) on delete set null,
  customer_id uuid not null references public.customers(id) on delete cascade,
  status      public.invoice_status not null default 'draft',
  subtotal    integer not null default 0,
  tax         integer not null default 0,
  total       integer not null default 0,
  amount_paid integer not null default 0,
  due_date    date,
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists idx_invoices_org      on public.invoices(org_id);
create index if not exists idx_invoices_customer on public.invoices(customer_id);
create or replace trigger trg_invoices_updated
  before update on public.invoices for each row execute function public.set_updated_at();

create table if not exists public.invoice_line_items (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations(id) on delete cascade,
  invoice_id  uuid not null references public.invoices(id) on delete cascade,
  description text not null,
  quantity    numeric(10,2) not null default 1,
  unit_price  integer not null default 0,
  line_total  integer not null default 0
);
create index if not exists idx_ili_invoice on public.invoice_line_items(invoice_id);
create index if not exists idx_ili_org     on public.invoice_line_items(org_id);

-- ---------- payments ----------
create table if not exists public.payments (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations(id) on delete cascade,
  invoice_id  uuid not null references public.invoices(id) on delete cascade,
  amount      integer not null,
  method      text not null default 'mock',
  paid_at     timestamptz not null default now(),
  created_by  uuid references public.profiles(id) on delete set null
);
create index if not exists idx_payments_invoice on public.payments(invoice_id);
create index if not exists idx_payments_org     on public.payments(org_id);

-- When a payment is recorded, bump invoice.amount_paid and flip to 'paid' once covered.
create or replace function public.apply_payment_to_invoice()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  update public.invoices i
  set amount_paid = i.amount_paid + new.amount,
      status = case
        when (i.amount_paid + new.amount) >= i.total and i.total > 0
          then 'paid'::public.invoice_status
        else i.status
      end
  where i.id = new.invoice_id;
  return new;
end; $$;

create or replace trigger trg_apply_payment
  after insert on public.payments
  for each row execute function public.apply_payment_to_invoice();
