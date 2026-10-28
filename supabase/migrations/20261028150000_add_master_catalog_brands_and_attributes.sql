-- Master catalog: brands and configurable category-specific product attributes.
-- This file is versioned only. Do not apply to any database without explicit approval.

create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  description text,
  logo_url text,
  website_url text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint brands_name_not_blank check (length(trim(name)) > 0),
  constraint brands_slug_not_blank check (length(trim(slug)) > 0),
  constraint brands_sort_order_nonnegative check (sort_order >= 0)
);
create unique index if not exists brands_slug_lower_unique on public.brands (lower(slug));
create unique index if not exists brands_name_lower_unique on public.brands (lower(name));

alter table public.products
  add column if not exists brand_id uuid null references public.brands(id) on delete set null;
create index if not exists products_brand_id_idx on public.products(brand_id);

create table if not exists public.product_attribute_definitions (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  data_type text not null default 'text'
    check (data_type in ('text','number','boolean','select','multiselect','range')),
  unit text,
  options jsonb not null default '[]'::jsonb
    check (jsonb_typeof(options) = 'array'),
  is_required boolean not null default false,
  is_filterable boolean not null default false,
  show_on_product_page boolean not null default true,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_attribute_definitions_name_not_blank check (length(trim(name)) > 0),
  constraint product_attribute_definitions_slug_not_blank check (length(trim(slug)) > 0),
  constraint product_attribute_definitions_sort_order_nonnegative check (sort_order >= 0)
);
create unique index if not exists product_attribute_definitions_category_slug_unique
  on public.product_attribute_definitions(category_id, lower(slug));
create index if not exists product_attribute_definitions_category_active_order_idx
  on public.product_attribute_definitions(category_id, is_active, sort_order);

create table if not exists public.product_attribute_values (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  attribute_id uuid not null references public.product_attribute_definitions(id) on delete cascade,
  value jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(product_id, attribute_id)
);
create index if not exists product_attribute_values_attribute_idx
  on public.product_attribute_values(attribute_id);
create index if not exists product_attribute_values_product_idx
  on public.product_attribute_values(product_id);

alter table public.brands enable row level security;
alter table public.product_attribute_definitions enable row level security;
alter table public.product_attribute_values enable row level security;

drop policy if exists "Admins can manage brands" on public.brands;
create policy "Admins can manage brands" on public.brands
  for all to authenticated using ((select private.is_admin()))
  with check ((select private.is_admin()));
drop policy if exists "Public can view active brands" on public.brands;
create policy "Public can view active brands" on public.brands
  for select to anon, authenticated using (is_active = true);

drop policy if exists "Admins can manage product attribute definitions" on public.product_attribute_definitions;
create policy "Admins can manage product attribute definitions" on public.product_attribute_definitions
  for all to authenticated using ((select private.is_admin()))
  with check ((select private.is_admin()));
drop policy if exists "Public can view active product attribute definitions" on public.product_attribute_definitions;
create policy "Public can view active product attribute definitions" on public.product_attribute_definitions
  for select to anon, authenticated using (is_active = true);

drop policy if exists "Admins can manage product attribute values" on public.product_attribute_values;
create policy "Admins can manage product attribute values" on public.product_attribute_values
  for all to authenticated using ((select private.is_admin()))
  with check ((select private.is_admin()));
drop policy if exists "Public can view values for active products" on public.product_attribute_values;
create policy "Public can view values for active products" on public.product_attribute_values
  for select to anon, authenticated using (
    exists (
      select 1 from public.products p
      where p.id = product_id and p.is_active = true
    )
  );

grant select on public.brands, public.product_attribute_definitions, public.product_attribute_values to anon, authenticated;
grant insert, update, delete on public.brands, public.product_attribute_definitions, public.product_attribute_values to authenticated;

-- Initial, editable plant-care attributes. Values are deliberately not prefilled on products.
insert into public.product_attribute_definitions
  (category_id, name, slug, data_type, unit, options, is_required, is_filterable, show_on_product_page, sort_order)
select c.id, a.name, a.slug, a.data_type, a.unit, a.options::jsonb, a.is_required, a.is_filterable, true, a.sort_order
from public.categories c
cross join (values
  ('Iluminación requerida','iluminacion-requerida','select',null,'["Baja","Media","Alta"]',false,true,10),
  ('Fotoperiodo recomendado','fotoperiodo-recomendado','range','h/día','[]',false,false,20),
  ('Fertilización / abonado','fertilizacion-abonado','select',null,'["Baja","Media","Alta"]',false,true,30),
  ('Tipo de fertilizante','tipo-de-fertilizante','multiselect',null,'["Líquido","Cápsulas para raíces","Sólido","Otro"]',false,false,40),
  ('Sustrato nutritivo','sustrato-nutritivo','select',null,'["Necesario","Recomendado","No necesario"]',false,true,50),
  ('Tipo de sustrato','tipo-de-sustrato','multiselect',null,'["Grava","Arena","Suelo nutritivo","No aplica","Otro"]',false,false,60),
  ('Requerimiento de CO₂','requerimiento-co2','select',null,'["No necesario","Opcional","Recomendado","Necesario"]',false,true,70),
  ('Temperatura del agua','temperatura-del-agua','range','°C','[]',false,true,80),
  ('Rango de pH','rango-ph','range','pH','[]',false,true,90),
  ('Dureza del agua','dureza-del-agua','text',null,'[]',false,false,100),
  ('Dificultad de mantenimiento','dificultad-de-mantenimiento','select',null,'["Fácil","Intermedia","Avanzada"]',false,true,110),
  ('Velocidad de crecimiento','velocidad-de-crecimiento','select',null,'["Lenta","Media","Rápida"]',false,true,120),
  ('Ubicación en el acuario','ubicacion-en-el-acuario','multiselect',null,'["Primer plano","Plano medio","Fondo","Superficie"]',false,true,130),
  ('Forma de propagación','forma-de-propagacion','multiselect',null,'["Rizoma","Esquejes","Estolones","División","Semillas","Otra"]',false,false,140)
) as a(name, slug, data_type, unit, options, is_required, is_filterable, sort_order)
where c.slug = 'plantas'
and not exists (
  select 1 from public.product_attribute_definitions d
  where d.category_id = c.id and lower(d.slug) = a.slug
);
