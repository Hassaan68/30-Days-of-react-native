import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

export interface CartProduct {
  id: string;
  name: string;
  priceCents: number;
}

export interface CartItem extends CartProduct {
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  addItem: (product: CartProduct) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

/**
 * Zustand v5 store managing shopping cart client state.
 * Components subscribe to fine-grained slices via selectors so unrelated UI never re-renders.
 */
export const useCartStore = create<CartState>()((set) => ({
  items: [],

  addItem: (product) =>
    set((state) => {
      const existing = state.items.find((item) => item.id === product.id);
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
          ),
        };
      }
      return {
        items: [...state.items, { ...product, quantity: 1 }],
      };
    }),

  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== productId),
    })),

  updateQuantity: (productId, quantity) =>
    set((state) => {
      if (quantity <= 0) {
        return {
          items: state.items.filter((item) => item.id !== productId),
        };
      }
      return {
        items: state.items.map((item) =>
          item.id === productId ? { ...item, quantity } : item,
        ),
      };
    }),

  clearCart: () => set({ items: [] }),
}));

/**
 * Reusable pure selectors — easy to test and share across screens.
 */
export const selectCartItemCount = (state: CartState): number =>
  state.items.reduce((total, item) => total + item.quantity, 0);

export const selectCartSubtotalCents = (state: CartState): number =>
  state.items.reduce((total, item) => total + item.priceCents * item.quantity, 0);

/**
 * In Zustand v5, whenever a selector returns a newly created object or array,
 * wrap it with `useShallow` to avoid infinite re-render loops.
 */
export function useCartSummary() {
  return useCartStore(
    useShallow((state) => ({
      itemCount: selectCartItemCount(state),
      subtotalCents: selectCartSubtotalCents(state),
      isEmpty: state.items.length === 0,
    })),
  );
}
