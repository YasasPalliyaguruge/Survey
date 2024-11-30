-- Drop existing tables if they exist
drop table if exists public.responses;
drop table if exists public.surveys;

-- Create surveys table
create table if not exists public.surveys (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    description text,
    questions jsonb not null default '[]'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create responses table
create table if not exists public.responses (
    id uuid default gen_random_uuid() primary key,
    survey_id uuid references public.surveys(id) on delete cascade,
    respondent_id uuid not null,
    answers jsonb not null default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.surveys enable row level security;
alter table public.responses enable row level security;

-- Drop existing policies
drop policy if exists "Surveys are viewable by everyone" on public.surveys;
drop policy if exists "Surveys can be created by anyone" on public.surveys;
drop policy if exists "Surveys can be updated by anyone" on public.surveys;
drop policy if exists "Surveys can be deleted by anyone" on public.surveys;
drop policy if exists "Responses are viewable by everyone" on public.responses;
drop policy if exists "Responses can be created by anyone" on public.responses;
drop policy if exists "Responses can be updated by anyone" on public.responses;
drop policy if exists "Responses can be deleted by anyone" on public.responses;

-- Create policies
create policy "Surveys are viewable by everyone"
    on public.surveys for select
    using (true);

create policy "Surveys can be created by anyone"
    on public.surveys for insert
    with check (true);

create policy "Surveys can be updated by anyone"
    on public.surveys for update
    using (true);

create policy "Surveys can be deleted by anyone"
    on public.surveys for delete
    using (true);

create policy "Responses are viewable by everyone"
    on public.responses for select
    using (true);

create policy "Responses can be created by anyone"
    on public.responses for insert
    with check (true);

create policy "Responses can be updated by anyone"
    on public.responses for update
    using (true);

create policy "Responses can be deleted by anyone"
    on public.responses for delete
    using (true);

-- Create indexes
create index if not exists surveys_created_at_idx on public.surveys(created_at);
create index if not exists responses_survey_id_idx on public.responses(survey_id);
create index if not exists responses_respondent_id_idx on public.responses(respondent_id);

-- Enable realtime
alter publication supabase_realtime add table public.surveys;
alter publication supabase_realtime add table public.responses;
