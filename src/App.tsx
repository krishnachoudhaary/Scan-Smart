import React, { useState, useEffect, useCallback } from 'react';
import { Scanner } from './components/Scanner';
import { ProductDetails } from './components/ProductDetails';
import { DiscoveryModal } from './components/DiscoveryModal';
import { UrlSafetyReport } from './components/UrlSafetyReport';
import { Pantry } from './components/Pantry';
import { Profile } from './components/Profile';
import { Dashboard } from './components/Dashboard';
import { Product, PantryItem, UserProfile, UrlSafetyResult } from './types';
import { fetchProductByBarcode } from './lib/api';
import { cloudStorage } from './lib/cloudStorage';
import { checkUrlSafety } from './lib/ai';
import { auth, signInWithGoogle, logout } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  Scan, 
  Package, 
  User as UserIcon, 
  Loader2,
  X,
  LayoutDashboard,
  LogIn,
  LogOut,
  ShieldCheck,
  PackagePlus,
  MapPin,
  Tag,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';


type Tab = 'scan' | 'pantry' | 'dashboard' | 'profile';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('scan');
  const [locationCity, setLocationCity] = useState<string | null>(null);
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [urlSafetyResult, setUrlSafetyResult] = useState<UrlSafetyResult | null>(null);
  const [discoveryBarcode, setDiscoveryBarcode] = useState<string | null>(null);
  const [manualBarcode, setManualBarcode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pantry, setPantry] = useState<PantryItem[]>([]);
  const [profile, setProfile] = useState<UserProfile>({ uid: '', name: 'User', restrictions: [], isSmartMode: true });
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const isSmartMode = profile.isSmartMode ?? true;

  const setIsSmartMode = async (val: boolean) => {
    const updatedProfile = { ...profile, isSmartMode: val };
    setProfile(updatedProfile);
    if (user) {
      await cloudStorage.saveProfile(updatedProfile);
    }
  };

  const requestLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        // Simple reverse geocoding simulation or using a free API
        // For hackathon, we'll simulate the city name based on coordinates or just use a default
        // In a real app, you'd use a service like Google Maps Geocoding or Nominatim
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await response.json();
        const city = data.address.city || data.address.town || data.address.suburb || 'Nearby';
        setLocationCity(city);
      } catch (err) {
        setLocationCity('Nearby');
      }
    }, () => {
      setLocationCity('Nearby');
    });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
      if (currentUser) {
        const userProfile = await cloudStorage.getProfile(currentUser.uid);
        if (userProfile) {
          setProfile(userProfile);
        } else {
          const initialProfile = { uid: currentUser.uid, name: currentUser.displayName || 'User', restrictions: [], isSmartMode: true };
          setProfile(initialProfile);
          await cloudStorage.saveProfile(initialProfile);
        }
      }
    });

    // Fallback if Firebase takes too long or fails (common in remixed apps)
    const timeout = setTimeout(() => {
      setIsAuthReady(true);
    }, 3000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (user) {
      const unsubscribe = cloudStorage.subscribeToPantry(setPantry);
      return () => unsubscribe();
    } else {
      setPantry([]);
    }
  }, [user]);

  const handleScan = useCallback(async (barcode: string) => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);
    setUrlSafetyResult(null);
    if (!locationCity) requestLocation();

    const isUrl = barcode.startsWith('http://') || barcode.startsWith('https://');
    const isBarcode = /^\d+$/.test(barcode);

    try {
      if (isUrl) {
        const safety = await checkUrlSafety(barcode);
        setUrlSafetyResult({ ...safety, url: barcode });
        if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
      } else if (isBarcode) {
        const product = await fetchProductByBarcode(barcode);
        if (product) {
          setScannedProduct(product);
          if ('vibrate' in navigator) navigator.vibrate(100);
        } else {
          setDiscoveryBarcode(barcode);
          if ('vibrate' in navigator) navigator.vibrate([50, 50, 50]);
        }
      } else {
        // Plain text QR code
        setError(`Scanned Text: ${barcode}`);
        if ('vibrate' in navigator) navigator.vibrate(50);
      }
    } catch (err) {
      setError("Failed to fetch information.");
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, locationCity]);

  const handleDiscoverySaved = useCallback((product: Product) => {
    setDiscoveryBarcode(null);
    setScannedProduct(product);
  }, []);

  const handleSaveToPantry = useCallback(async (item: Omit<PantryItem, 'id' | 'addedAt' | 'uid'>) => {
    if (!user) {
      setError("Please sign in to save items.");
      return;
    }
    await cloudStorage.savePantryItem({
      ...item,
      uid: user.uid
    });
    setScannedProduct(null);
    setActiveTab('pantry');
  }, [user]);

  const handleRemoveFromPantry = async (id: string) => {
    await cloudStorage.removePantryItem(id);
  };

  const handleUpdateProfile = async (newProfile: UserProfile) => {
    setProfile(newProfile);
    await cloudStorage.saveProfile(newProfile);
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-[2rem] bg-indigo-50 flex items-center justify-center">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
          </div>
          <p className="text-xs font-black text-indigo-900 uppercase tracking-widest">Initializing Smart-Sync</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 max-w-md mx-auto bg-[#F8FAFC] relative overflow-x-hidden font-sans">
      {/* Auth Header */}
      {!user && activeTab !== 'scan' && (
        <div className="p-8 glass-effect border-b flex flex-col items-center text-center space-y-6 m-4 rounded-[2.5rem] soft-shadow">
          <div className="w-20 h-20 bg-indigo-100 rounded-[2.5rem] flex items-center justify-center text-indigo-600">
            {isLoading ? (
              <Loader2 className="animate-spin" size={40} />
            ) : (
              <ShieldCheck size={40} />
            )}
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900">Cloud Sync Required</h2>
            <p className="text-slate-500 text-sm font-medium">Sign in to save your pantry and preferences to the cloud.</p>
          </div>
          <button 
            onClick={async () => {
              setIsLoading(true);
              try {
                await signInWithGoogle();
              } catch (err: any) {
                console.error("Sign-in error:", err);
                setError(err.message || "Failed to sign in");
              } finally {
                setIsLoading(false);
              }
            }}
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 active:scale-95 transition-all disabled:opacity-50"
          >
            <LogIn size={20} />
            Continue with Google
          </button>
        </div>
      )}

      {user && (
        <div className="px-6 py-4 flex justify-between items-center glass-effect sticky top-0 z-30 border-b">
          <div className="flex items-center gap-3">
            <img src={user.photoURL || ''} className="w-10 h-10 rounded-2xl border-2 border-white shadow-sm" alt="" />
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Welcome back</span>
                {locationCity && (
                  <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-[8px] font-black uppercase tracking-tighter border border-indigo-100 animate-in fade-in slide-in-from-top-1 duration-500">
                    <MapPin size={8} strokeWidth={3} />
                    Best Prices in {locationCity}
                  </div>
                )}
              </div>
              <span className="text-sm font-black text-slate-900">{user.displayName?.split(' ')[0]}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsSmartMode(!isSmartMode)}
              className={`flex items-center gap-2 px-3 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 ${isSmartMode ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}
            >
              <ShieldCheck size={14} className={isSmartMode ? 'text-emerald-500' : 'text-slate-400'} />
              Smart {isSmartMode ? 'ON' : 'OFF'}
            </button>
            <button onClick={logout} className="p-2.5 bg-slate-50 text-slate-400 hover:text-red-500 rounded-2xl transition-all active:scale-95">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main>
        {activeTab === 'scan' && (
          <div className="p-6 space-y-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tight text-slate-900">ScanSmart</h1>
              <p className="text-slate-500 font-medium">Reveal the truth behind the label</p>
            </div>

            <div className="relative">
              <Scanner onScan={handleScan} />
              
              <AnimatePresence>
                {isLoading && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center rounded-[2.5rem] z-10 border-2 border-indigo-500/20"
                  >
                    <div className="w-48 space-y-4">
                      <div className="h-4 w-3/4 shimmer rounded-full mx-auto"></div>
                      <div className="h-32 w-full shimmer rounded-[2rem]"></div>
                      <div className="h-4 w-1/2 shimmer rounded-full mx-auto"></div>
                    </div>
                    <p className="font-black text-indigo-900 mt-8 uppercase tracking-[0.2em] text-[10px]">Analyzing Molecular Data</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 soft-shadow">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Manual Entry</p>
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (manualBarcode.trim()) {
                    handleScan(manualBarcode.trim());
                    setManualBarcode('');
                  }
                }}
                className="flex gap-3"
              >
                <input 
                  type="text"
                  placeholder="Enter barcode number..."
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  className="flex-1 px-6 py-4 rounded-[1.5rem] bg-slate-50 border-0 font-bold text-slate-900 focus:ring-2 ring-indigo-500 outline-none transition-all placeholder:text-slate-300"
                />
                <button 
                  type="submit"
                  disabled={!manualBarcode.trim() || isLoading}
                  className="p-4 bg-indigo-600 text-white rounded-[1.5rem] soft-shadow active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                >
                  <ArrowRight size={24} strokeWidth={3} />
                </button>
              </form>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 bg-red-50 border border-red-100 rounded-[2rem] flex items-center justify-between text-red-600 font-bold soft-shadow"
              >
                <div className="flex items-center gap-3">
                  <X className="bg-red-500 text-white rounded-full p-1" size={20} />
                  <span>{error}</span>
                </div>
                <button onClick={() => setError(null)} className="text-slate-400 active:scale-95 transition-all"><X size={18} /></button>
              </motion.div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-white rounded-[2.5rem] border border-slate-100 soft-shadow space-y-3">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                  <Scan size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Scans</p>
                  <p className="text-2xl font-black text-slate-900">1.2k+</p>
                </div>
              </div>
              <div className="p-6 bg-white rounded-[2.5rem] border border-slate-100 soft-shadow space-y-3">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                  <Package size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">My Pantry</p>
                  <p className="text-2xl font-black text-slate-900">{pantry.length}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pantry' && (
          <Pantry items={pantry} onRemove={handleRemoveFromPantry} locationCity={locationCity} onCheckPrices={requestLocation} />
        )}

        {activeTab === 'dashboard' && (
          <Dashboard items={pantry} />
        )}

        {activeTab === 'profile' && (
          <Profile profile={profile} onUpdate={handleUpdateProfile} />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto glass-effect border-t px-4 py-4 flex justify-around items-center z-40 rounded-t-[2.5rem] soft-shadow">
        <button 
          onClick={() => setActiveTab('scan')}
          className={`flex flex-col items-center gap-1.5 transition-all duration-300 active:scale-95 ${activeTab === 'scan' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}
        >
          <div className={`p-2.5 rounded-2xl transition-colors ${activeTab === 'scan' ? 'bg-indigo-50' : ''}`}>
            <Scan size={24} strokeWidth={activeTab === 'scan' ? 3 : 2} />
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.15em]">Scan</span>
        </button>

        <button 
          onClick={() => setActiveTab('pantry')}
          className={`flex flex-col items-center gap-1.5 transition-all duration-300 active:scale-95 ${activeTab === 'pantry' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}
        >
          <div className={`p-2.5 rounded-2xl transition-colors ${activeTab === 'pantry' ? 'bg-indigo-50' : ''}`}>
            <Package size={24} strokeWidth={activeTab === 'pantry' ? 3 : 2} />
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.15em]">Pantry</span>
        </button>

        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1.5 transition-all duration-300 active:scale-95 ${activeTab === 'dashboard' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}
        >
          <div className={`p-2.5 rounded-2xl transition-colors ${activeTab === 'dashboard' ? 'bg-indigo-50' : ''}`}>
            <LayoutDashboard size={24} strokeWidth={activeTab === 'dashboard' ? 3 : 2} />
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.15em]">Impact</span>
        </button>

        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1.5 transition-all duration-300 active:scale-95 ${activeTab === 'profile' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}
        >
          <div className={`p-2.5 rounded-2xl transition-colors ${activeTab === 'profile' ? 'bg-indigo-50' : ''}`}>
            <UserIcon size={24} strokeWidth={activeTab === 'profile' ? 3 : 2} />
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.15em]">Profile</span>
        </button>
      </nav>

      {/* Product Details Overlay */}
      <AnimatePresence>
        {scannedProduct && (
          <ProductDetails 
            product={scannedProduct} 
            userProfile={profile}
            locationCity={locationCity}
            isSmartMode={isSmartMode}
            onClose={() => setScannedProduct(null)}
            onSaveToPantry={handleSaveToPantry}
          />
        )}
      </AnimatePresence>

      {/* URL Safety Report Overlay */}
      <AnimatePresence>
        {urlSafetyResult && (
          <UrlSafetyReport 
            result={urlSafetyResult}
            onClose={() => setUrlSafetyResult(null)}
          />
        )}
      </AnimatePresence>

      {/* Discovery Modal Overlay */}
      <AnimatePresence>
        {discoveryBarcode && (
          <DiscoveryModal 
            barcode={discoveryBarcode}
            onClose={() => setDiscoveryBarcode(null)}
            onSaved={handleDiscoverySaved}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
