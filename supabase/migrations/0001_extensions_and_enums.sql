-- 0001 — extensions and enum types
-- Idempotent: safe to re-run.

create extension if not exists pgcrypto; -- gen_random_uuid()

do $$ begin
  create type public.user_role as enum ('owner', 'employee', 'client');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.job_status as enum (
    'requested', 'scheduled', 'assigned', 'en_route', 'on_site', 'completed', 'cancelled'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.quote_status as enum ('draft', 'sent', 'approved', 'declined');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.invoice_status as enum ('draft', 'sent', 'paid');
exception when duplicate_object then null; end $$;
