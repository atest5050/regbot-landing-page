-- ── checklist_items ──────────────────────────────────────────────────────────
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query)

create table if not exists checklist_items (
  id            uuid        primary key default gen_random_uuid(),
  user_id       uuid        references auth.users not null,
  text          text        not null,
  fee           text,
  status        text        not null default 'todo'
                            check (status in ('todo', 'in-progress', 'done', 'blocked')),
  due_date      timestamptz,
  notes         text,
  completed_via text,         -- e.g. "RegBot AI Form Filler"
  completed_at  timestamptz,
  form_id       text,         -- formTemplates.ts ID — enables "Complete Form" button
  created_at    timestamptz   not null default now()
);

-- Enable Row Level Security
alter table checklist_items enable row level security;

-- Each user can only access their own rows
create policy "select_own" on checklist_items
  for select using (auth.uid() = user_id);

create policy "insert_own" on checklist_items
  for insert with check (auth.uid() = user_id);

create policy "update_own" on checklist_items
  for update using (auth.uid() = user_id);

create policy "delete_own" on checklist_items
  for delete using (auth.uid() = user_id);

-- Index for fast per-user queries
create index if not exists checklist_items_user_id_idx
  on checklist_items (user_id, created_at desc);
