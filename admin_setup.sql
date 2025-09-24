-- Setup admin role for jamesbenavides617@gmail.com
-- Run this SQL in your Supabase dashboard > SQL Editor

-- Create the comments table if it doesn't exist
create table if not exists comments (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  message text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  reply_to uuid references comments(id) on delete cascade
);

-- Create the user_roles table if it doesn't exist
create table if not exists user_roles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  role text not null default 'user' check (role in ('admin', 'moderator', 'user')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on tables
alter table comments enable row level security;
alter table user_roles enable row level security;

-- RLS policies for comments
drop policy if exists "Comments are viewable by everyone" on comments;
create policy "Comments are viewable by everyone" on comments
  for select using (true);

drop policy if exists "Users can insert their own comments" on comments;
create policy "Users can insert their own comments" on comments
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own comments" on comments;
create policy "Users can update their own comments" on comments
  for update using (auth.uid() = user_id);

drop policy if exists "Users can delete their own comments" on comments;
create policy "Users can delete their own comments" on comments
  for delete using (auth.uid() = user_id);

drop policy if exists "Admins and moderators can delete any comment" on comments;
create policy "Admins and moderators can delete any comment" on comments
  for delete using (
    exists (
      select 1 from user_roles 
      where user_id = auth.uid() 
      and role in ('admin', 'moderator')
    )
  );

-- RLS policies for user_roles
drop policy if exists "User roles are viewable by everyone" on user_roles;
create policy "User roles are viewable by everyone" on user_roles
  for select using (true);

drop policy if exists "Only admins can manage user roles" on user_roles;
create policy "Only admins can manage user roles" on user_roles
  for all using (
    exists (
      select 1 from user_roles 
      where user_id = auth.uid() 
      and role = 'admin'
    )
  );

-- Function to automatically assign admin role to specific email
create or replace function assign_admin_role()
returns trigger as $$
begin
  -- Check if the new user has the admin email
  if new.email = 'jamesbenavides617@gmail.com' then
    insert into user_roles (user_id, role)
    values (new.id, 'admin');
  else
    -- Assign default user role to all other users
    insert into user_roles (user_id, role)
    values (new.id, 'user');
  end if;
  
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger to automatically assign roles when users sign up
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function assign_admin_role();

-- If the admin user already exists, make sure they have admin role
do $$
declare
  admin_user_id uuid;
begin
  -- Find the admin user by email
  select id into admin_user_id
  from auth.users 
  where email = 'jamesbenavides617@gmail.com';
  
  -- If the user exists, ensure they have admin role
  if admin_user_id is not null then
    insert into user_roles (user_id, role)
    values (admin_user_id, 'admin')
    on conflict (user_id) 
    do update set role = 'admin';
  end if;
end;
$$;