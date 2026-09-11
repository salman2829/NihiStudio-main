import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, CurrencyType, User } from '@/lib/types';

interface StoreState {
  // Cart
  cart: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  getCartTotal: () => { inr: number; usd: number };
  getCartItemCount: () => number;

  // Wishlist
  wishlist: string[]; // product IDs
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Currency & Geolocation
  currency: CurrencyType;
  setCurrency: (currency: CurrencyType) => void;
  country: string;
  setCountry: (country: string) => void;

  // User & Authentication
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register';
  setIsAuthModalOpen: (open: boolean, tab?: 'login' | 'register') => void;
  fetchCurrentUser: () => Promise<void>;
  logout: () => Promise<void>;

  // Modals & UI
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isSizeModalOpen: boolean;
  setIsSizeModalOpen: (open: boolean) => void;
  sizeModalType: 'ring' | 'bangle';
  setSizeModalType: (type: 'ring' | 'bangle') => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Cart
      cart: [],
      isCartOpen: false,
      setIsCartOpen: (open) => set({ isCartOpen: open }),
      addToCart: (item) => {
        const id = `${item.productId}-${item.variantId}-${item.size || 'std'}-${item.engravingText || 'none'}-${item.giftWrap ? 'gw' : 'nogw'}`;
        const existing = get().cart.find((i) => i.id === id);

        if (existing) {
          set((state) => ({
            cart: state.cart.map((i) =>
              i.id === id ? { ...i, quantity: i.quantity + item.quantity } : i
            ),
            isCartOpen: true,
          }));
        } else {
          set((state) => ({
            cart: [...state.cart, { ...item, id }],
            isCartOpen: true,
          }));
        }
      },
      removeFromCart: (id) => {
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== id),
        }));
      },
      updateQuantity: (id, delta) => {
        set((state) => ({
          cart: state.cart
            .map((item) => {
              if (item.id === id) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : null;
              }
              return item;
            })
            .filter((item): item is CartItem => item !== null),
        }));
      },
      clearCart: () => set({ cart: [] }),
      getCartTotal: () => {
        const { cart } = get();
        return cart.reduce(
          (acc, item) => {
            const giftCostINR = item.giftWrap ? 199 : 0;
            const giftCostUSD = item.giftWrap ? 3 : 0;
            return {
              inr: acc.inr + (item.priceINR + giftCostINR) * item.quantity,
              usd: acc.usd + (item.priceUSD + giftCostUSD) * item.quantity,
            };
          },
          { inr: 0, usd: 0 }
        );
      },
      getCartItemCount: () => {
        const { cart } = get();
        return cart.reduce((total, item) => total + item.quantity, 0);
      },

      // Wishlist
      wishlist: [],
      toggleWishlist: (productId) => {
        set((state) => {
          const exists = state.wishlist.includes(productId);
          return {
            wishlist: exists
              ? state.wishlist.filter((id) => id !== productId)
              : [...state.wishlist, productId],
          };
        });
      },
      isInWishlist: (productId) => {
        return get().wishlist.includes(productId);
      },

      // Currency & Country
      currency: 'INR',
      setCurrency: (currency) => set({ currency }),
      country: 'India',
      setCountry: (country) => {
        const currency = country === 'United States' ? 'USD' : 'INR';
        set({ country, currency });
      },

      // User & Authentication
      user: null,
      setUser: (user) => set({ user }),
      isAuthModalOpen: false,
      authModalTab: 'login',
      setIsAuthModalOpen: (open, tab = 'login') =>
        set({ isAuthModalOpen: open, authModalTab: tab }),
      fetchCurrentUser: async () => {
        try {
          const res = await fetch('/api/auth/me');
          if (res.ok) {
            const data = await res.json();
            set({ user: data.user || null });
          }
        } catch {
          // ignore error
        }
      },
      logout: async () => {
        try {
          await fetch('/api/auth/logout', { method: 'POST' });
          set({ user: null });
        } catch {
          set({ user: null });
        }
      },

      // Modals
      isSearchOpen: false,
      setIsSearchOpen: (open) => set({ isSearchOpen: open }),
      isSizeModalOpen: false,
      setIsSizeModalOpen: (open) => set({ isSizeModalOpen: open }),
      sizeModalType: 'ring',
      setSizeModalType: (type) => set({ sizeModalType: type }),
    }),
    {
      name: 'nihi-studio-storage',
      partialize: (state) => ({
        cart: state.cart,
        wishlist: state.wishlist,
        currency: state.currency,
        country: state.country,
        user: state.user,
      }),
    }
  )
);
