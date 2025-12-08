// src/lib/productApi.ts
import { z } from 'zod';

const OffNutriments = z.object({
  energy_kcal_100g: z.number().optional(),
  fat_100g: z.number().optional(),
  sugars_100g: z.number().optional(),
  proteins_100g: z.number().optional(),
});

const OffProduct = z.object({
  code: z.string(), // barcode
  product_name: z.string().optional(),
  brands: z.string().optional(),
  quantity: z.string().optional(),
  categories: z.string().optional(),
  image_url: z.string().url().optional(),
  nutriments: OffNutriments.optional(),
});

const OffResponse = z.object({
  status: z.number(),           // 1 = found, 0 = not found
  product: OffProduct.optional()
});

export type Product = {
  barcode: string;
  name?: string;
  brand?: string;
  quantity?: string;
  categories?: string;
  imageUrl?: string;
  nutriments?: {
    kcal100g?: number;
    fat100g?: number;
    sugar100g?: number;
    protein100g?: number;
  };
};

export async function fetchProductByBarcode(barcode: string): Promise<Product | null> {
  const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  const parsed = OffResponse.safeParse(json);
  if (!parsed.success || parsed.data.status !== 1 || !parsed.data.product) return null;

  const p = parsed.data.product;
  return {
    barcode: p.code,
    name: p.product_name,
    brand: p.brands,
    quantity: p.quantity,
    categories: p.categories,
    imageUrl: p.image_url,
    nutriments: p.nutriments
      ? {
          kcal100g: p.nutriments.energy_kcal_100g,
          fat100g: p.nutriments.fat_100g,
          sugar100g: p.nutriments.sugars_100g,
          protein100g: p.nutriments.proteins_100g,
        }
      : undefined,
  };
}
