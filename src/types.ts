export interface Product {
  barcode: string;
  name: string;
  brand: string;
  ingredients: string;
  nutritionGrade: string;
  ecoscore: string;
  imageUrl: string;
  novaScore: number;
  additives: string[];
  categories: string[];
}

export interface PantryItem extends Product {
  id: string;
  uid: string;
  quantity: number;
  manufactureDate: string;
  expiryDate: string;
  addedAt: string;
}

export interface PriceInfo {
  storeName: string;
  price: number;
  availability: boolean;
  url: string;
  color: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  restrictions: string[];
  isSmartMode?: boolean;
}

export interface UrlSafetyResult {
  url: string;
  isSafe: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  threatType: string[];
  explanation: string;
  recommendation: string;
}
