create table users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

create table stores (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  location_metadata jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores(id),
  external_id text not null,
  name text not null,
  brand text,
  size text,
  unit text,
  category text,
  image_url text,
  product_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (store_id, external_id)
);

create table product_prices (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id),
  price numeric(10, 2) not null,
  unit_price numeric(10, 4),
  currency text not null default 'USD',
  sale_price numeric(10, 2),
  observed_at timestamptz not null default now(),
  source text not null
);

create table grocery_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table grocery_list_items (
  id uuid primary key default gen_random_uuid(),
  grocery_list_id uuid not null references grocery_lists(id) on delete cascade,
  raw_text text not null,
  normalized_name text not null,
  quantity numeric(10, 2),
  unit text,
  notes text,
  created_at timestamptz not null default now()
);

create table product_matches (
  id uuid primary key default gen_random_uuid(),
  grocery_list_item_id uuid not null references grocery_list_items(id) on delete cascade,
  product_id uuid not null references products(id),
  store_id uuid not null references stores(id),
  match_score numeric(5, 4) not null,
  match_reason text,
  ai_model text,
  created_at timestamptz not null default now()
);

create table comparison_runs (
  id uuid primary key default gen_random_uuid(),
  grocery_list_id uuid not null references grocery_lists(id) on delete cascade,
  status text not null,
  total_single_store_json jsonb not null,
  total_split_store numeric(10, 2) not null,
  estimated_savings numeric(10, 2) not null,
  trip_evaluation_json jsonb not null,
  created_at timestamptz not null default now()
);
