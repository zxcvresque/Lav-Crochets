import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  slug: string;
  title: string;
  priceINR: number;
  wasINR?: number;
  quantity: number;
  image?: string;
  artVariant?: string;
  stockStatus: "ready" | "made-to-order";
}

interface CouponState {
  code: string;
  discount: number;
  type: "flat" | "percent";
}

interface CartStore {
  items: CartItem[];
  coupon: CouponState | null;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (coupon: CouponState) => void;
  removeCoupon: () => void;
  getSubtotal: () => number;
  getDiscount: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: Math.min(i.quantity + 1, 20) } : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        });
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }));
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity: Math.min(quantity, 20) } : i
          ),
        }));
      },

      clearCart: () => set({ items: [], coupon: null }),

      applyCoupon: (coupon) => set({ coupon }),

      removeCoupon: () => set({ coupon: null }),

      getSubtotal: () => {
        const { items } = get();
        return items.reduce((sum, item) => sum + item.priceINR * item.quantity, 0);
      },

      getDiscount: () => {
        const { coupon, getSubtotal } = get();
        if (!coupon) return 0;
        const subtotal = getSubtotal();
        const raw = coupon.type === "flat" ? coupon.discount : Math.round((subtotal * coupon.discount) / 100);
        return Math.min(raw, subtotal);
      },

      getTotal: () => {
        const { getSubtotal, getDiscount } = get();
        return getSubtotal() - getDiscount();
      },

      getItemCount: () => {
        const { items } = get();
        return items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: "lav-cart",
      // Only persist the cart contents, not whether the drawer is open.
      partialize: (state) => ({ items: state.items, coupon: state.coupon }),
      merge: (persisted, current) => {
        const p = (persisted || {}) as Partial<CartStore>;
        return { ...current, items: p.items ?? [], coupon: p.coupon ?? null, isOpen: false };
      },
    }
  )
);
