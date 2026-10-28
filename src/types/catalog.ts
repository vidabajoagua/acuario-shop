export type ProductCategory = {
  id: string;
  name: string;
  slug: string;
};

export type ProductInventory = {
  quantity: number;
};

export type ProductImage = {
  id: string;
  product_id: string;
  storage_path: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
  url: string;
};

export type ProductTaxonomyTerm = {
  id: string;
  category_id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  sort_order: number;
};

export type CatalogProduct = {
  id: string;
  category_id: string;

  name: string;
  slug: string;

  short_description: string | null;
  description: string | null;

  brand: string | null;
  sku: string | null;

  price: number;
  compare_at_price: number | null;

  is_active: boolean;
  is_featured: boolean;

  categories: ProductCategory | null;

  inventory: ProductInventory | null;

  images: ProductImage[];
};