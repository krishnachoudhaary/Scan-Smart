import { Product } from '../types';
import { storage } from './storage';

const OFF_API_BASE = 'https://world.openfoodfacts.org/api/v0';

export async function fetchProductByBarcode(barcode: string): Promise<Product | null> {
  // Check community data first
  const communityData = storage.getCommunityData();
  const localProduct = communityData.find(p => p.barcode === barcode);
  if (localProduct) return localProduct;

  try {
    const response = await fetch(`${OFF_API_BASE}/product/${barcode}.json`);
    const data = await response.json();

    if (data.status !== 1) return null;

    const p = data.product;
    return {
      barcode,
      name: p.product_name || 'Unknown Product',
      brand: p.brands || 'Unknown Brand',
      ingredients: p.ingredients_text || '',
      nutritionGrade: p.nutrition_grades || 'unknown',
      ecoscore: p.ecoscore_grade || 'unknown',
      imageUrl: p.image_url || '',
      novaScore: p.nova_group || 0,
      additives: p.additives_tags?.map((a: string) => a.replace('en:', '')) || [],
      categories: p.categories_tags || [],
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export async function fetchAlternatives(category: string): Promise<Product[]> {
  try {
    // Search for products in the same category with better nutrition grades
    const response = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?action=process&tagtype_0=categories&tag_contains_0=contains&tag_0=${category}&nutrition_grades=a&json=true&page_size=5`
    );
    const data = await response.json();
    
    return (data.products || []).map((p: any) => ({
      barcode: p.code,
      name: p.product_name || 'Unknown Product',
      brand: p.brands || 'Unknown Brand',
      ingredients: p.ingredients_text || '',
      nutritionGrade: p.nutrition_grades || 'unknown',
      ecoscore: p.ecoscore_grade || 'unknown',
      imageUrl: p.image_url || '',
      novaScore: p.nova_group || 0,
      additives: p.additives_tags?.map((a: string) => a.replace('en:', '')) || [],
      categories: p.categories_tags || [],
    }));
  } catch (error) {
    console.error('Error fetching alternatives:', error);
    return [];
  }
}
