import { Product, PantryItem, UserProfile } from '../types';

const PANTRY_KEY = 'scansmart_pantry';
const PROFILE_KEY = 'scansmart_profile';
const COMMUNITY_KEY = 'ss_community_data';

export const storage = {
  getPantry: (): PantryItem[] => {
    const data = localStorage.getItem(PANTRY_KEY);
    return data ? JSON.parse(data) : [];
  },
  savePantry: (items: PantryItem[]) => {
    localStorage.setItem(PANTRY_KEY, JSON.stringify(items));
  },
  getProfile: (): UserProfile => {
    const data = localStorage.getItem(PROFILE_KEY);
    return data ? JSON.parse(data) : { uid: '', name: 'User', restrictions: [] };
  },
  saveProfile: (profile: UserProfile) => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  },
  getCommunityData: (): Product[] => {
    const data = localStorage.getItem(COMMUNITY_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveCommunityProduct: (product: Product) => {
    const data = storage.getCommunityData();
    localStorage.setItem(COMMUNITY_KEY, JSON.stringify([...data, product]));
  }
};
