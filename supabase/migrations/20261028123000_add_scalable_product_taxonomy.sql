-- Scalable, category-specific product taxonomy with unlimited hierarchy.
create table if not exists public.product_taxonomy_terms (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  parent_id uuid null references public.product_taxonomy_terms(id) on delete restrict,
  name text not null,
  slug text not null,
  description text null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_taxonomy_terms_name_not_blank check (length(trim(name)) > 0),
  constraint product_taxonomy_terms_slug_not_blank check (length(trim(slug)) > 0)
);

create unique index if not exists product_taxonomy_terms_root_unique
  on public.product_taxonomy_terms (category_id, lower(slug)) where parent_id is null;
create unique index if not exists product_taxonomy_terms_child_unique
  on public.product_taxonomy_terms (category_id, parent_id, lower(slug)) where parent_id is not null;
create index if not exists product_taxonomy_terms_category_parent_idx
  on public.product_taxonomy_terms (category_id, parent_id, is_active, sort_order);

alter table public.products
  add column if not exists taxonomy_term_id uuid null references public.product_taxonomy_terms(id) on delete set null;
create index if not exists products_taxonomy_term_id_idx on public.products(taxonomy_term_id);

alter table public.product_taxonomy_terms enable row level security;
drop policy if exists "Admins can manage product taxonomy terms" on public.product_taxonomy_terms;
create policy "Admins can manage product taxonomy terms"
  on public.product_taxonomy_terms for all to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));
drop policy if exists "Public can view active product taxonomy terms" on public.product_taxonomy_terms;
create policy "Public can view active product taxonomy terms"
  on public.product_taxonomy_terms for select to anon, authenticated
  using (is_active = true);

grant select on public.product_taxonomy_terms to anon, authenticated;
grant insert, update, delete on public.product_taxonomy_terms to authenticated;
grant select, insert, update on public.products to authenticated;

with plant_category as (
  select id from public.categories where slug = 'plantas' limit 1
), root_terms(name, slug, sort_order) as (
  values ('Rizoma','rizoma',10), ('Tallo','tallo',20), ('Bulbo','bulbo',30), ('Roseta','roseta',40), ('Flotante','flotante',50), ('Musgo','musgo',60), ('Tapizante','tapizante',70), ('Helecho','helecho',80)
)
insert into public.product_taxonomy_terms (category_id, parent_id, name, slug, sort_order)
select p.id, null, r.name, r.slug, r.sort_order
from plant_category p cross join root_terms r
where not exists (
  select 1 from public.product_taxonomy_terms t
  where t.category_id = p.id and t.parent_id is null and lower(t.slug) = r.slug
);

with plant_category as (
  select id from public.categories where slug = 'plantas' limit 1
), groups(name, slug, parent_slug, sort_order) as (
  values
    ('Anubias','anubias','rizoma',10),
    ('Bucephalandra','bucephalandra','rizoma',20),
    ('Microsorum','microsorum','rizoma',30),
    ('Bolbitis','bolbitis','rizoma',40),
    ('Rotala','rotala','tallo',10),
    ('Ludwigia','ludwigia','tallo',20),
    ('Hygrophila','hygrophila','tallo',30),
    ('Crinum','crinum','bulbo',10),
    ('Aponogeton','aponogeton','bulbo',20),
    ('Cryptocoryne','cryptocoryne','roseta',10),
    ('Echinodorus','echinodorus','roseta',20)
)
insert into public.product_taxonomy_terms (category_id, parent_id, name, slug, sort_order)
select c.id, parent.id, g.name, g.slug, g.sort_order
from plant_category c
join groups g on true
join public.product_taxonomy_terms parent on parent.category_id = c.id and parent.parent_id is null and parent.slug = g.parent_slug
where not exists (
  select 1 from public.product_taxonomy_terms t
  where t.category_id = c.id and t.parent_id = parent.id and lower(t.slug) = g.slug
);
