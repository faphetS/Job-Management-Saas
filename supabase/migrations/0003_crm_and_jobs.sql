-- 0003 — CRM (customers) and the core work order (jobs)

-- customers: the business's CRM record. profile_id links a client login when present.
create table if not exists public.customers (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations(id) on delete cascade,
  profile_id  uuid references public.profiles(id) on delete set null,
  full_name   text not null,
  email       text,
  phone       text,
  address     text,
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_customers_org     on public.customers(org_id);
create index if not exists idx_customers_profile on public.customers(profile_id);

create or replace trigger trg_customers_updated
  before update on public.customers
  for each row execute function public.set_updated_at();

-- jobs: the work order at the heart of the FSM workflow
create table if not exists public.jobs (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references public.organizations(id) on delete cascade,
  customer_id     uuid not null references public.customers(id) on delete cascade,
  assigned_to     uuid references public.profiles(id) on delete set null,
  status          public.job_status not null default 'requested',
  title           text not null,
  description     text,
  service_address text,
  scheduled_at    timestamptz,
  created_by      uuid references public.profiles(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_jobs_org_status on public.jobs(org_id, status);
create index if not exists idx_jobs_assigned   on public.jobs(assigned_to);
create index if not exists idx_jobs_customer   on public.jobs(customer_id);

create or replace trigger trg_jobs_updated
  before update on public.jobs
  for each row execute function public.set_updated_at();
