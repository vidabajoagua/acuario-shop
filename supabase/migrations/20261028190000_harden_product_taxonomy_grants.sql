-- Defense-in-depth: align SQL privileges with the existing product taxonomy RLS policies.
-- Versioned only. Do not apply to any database without explicit approval.
--
-- RLS remains the row-level authorization boundary:
--   * anon/authenticated may read active terms only (existing SELECT policy)
--   * authenticated administrators may manage terms (existing private.is_admin() policy)
-- This migration does not change data, table structure, or RLS policies.

revoke all privileges on table public.product_taxonomy_terms from anon;
grant select on table public.product_taxonomy_terms to anon;

revoke all privileges on table public.product_taxonomy_terms from authenticated;
grant select, insert, update, delete
  on table public.product_taxonomy_terms to authenticated;
