-- Create surveys table
create table public.surveys (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    description text,
    questions jsonb not null default '[]'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create responses table
create table public.responses (
    id uuid default gen_random_uuid() primary key,
    survey_id uuid references public.surveys(id) on delete cascade,
    answers jsonb not null default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.surveys enable row level security;
alter table public.responses enable row level security;

-- Create policies
create policy "Enable read access for all users" on public.surveys
    for select
    to anon
    using (true);

create policy "Enable insert access for all users" on public.surveys
    for insert
    to anon
    with check (true);

create policy "Enable update access for all users" on public.surveys
    for update
    to anon
    using (true);

create policy "Enable delete access for all users" on public.surveys
    for delete
    to anon
    using (true);

create policy "Enable read access for all users" on public.responses
    for select
    to anon
    using (true);

create policy "Enable insert access for all users" on public.responses
    for insert
    to anon
    with check (true);
