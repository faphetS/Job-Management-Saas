-- 0002 — core tables: organizations (tenant root) + profiles (1:1 with auth.users)

-- shared updated_at trigger helper
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

-- organizations: each row is one business (a tenant)
create table if not exists public.organizations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  phone       text,
  address     text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create or replace trigger trg_orgs_updated
  before update on public.organizations
  for each row execute function public.set_updated_at();

-- profiles: one per auth user. org_id is nullable so an owner can sign up
-- BEFORE creating their organization (set later by create_organization()).
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  org_id      uuid references public.organizations(id) on delete cascade,
  role        public.user_role not null default 'client',
  full_name   text,
  phone       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_profiles_org on public.profiles(org_id);

create or replace trigger trg_profiles_updated
  before update on public.profiles
  for each row execute function public.set_updated_at();
