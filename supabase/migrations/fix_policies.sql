-- Drop existing policies
drop policy if exists "Surveys are viewable by everyone" on public.surveys;
drop policy if exists "Only authenticated users can insert surveys" on public.surveys;
drop policy if exists "Only authenticated users can update their surveys" on public.surveys;
drop policy if exists "Only authenticated users can delete their surveys" on public.surveys;

-- Create new policies that allow anonymous access
create policy "Surveys are viewable by everyone"
    on public.surveys for select
    to anon
    using (true);

create policy "Anyone can create surveys"
    on public.surveys for insert
    to anon
    with check (true);

create policy "Anyone can update surveys"
    on public.surveys for update
    to anon
    using (true);

create policy "Anyone can delete surveys"
    on public.surveys for delete
    to anon
    using (true);
