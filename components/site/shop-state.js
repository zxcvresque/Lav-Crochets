"use client";
// Glue between the original site's UI and the shared cart store used by /checkout.
// The original App kept the cart in React state; here it lives in lib/cart (zustand,
// persisted to localStorage) so the drawer, header and checkout all see the same cart.
import { useEffect, useRef, useState } from "react";
import { create } from "zustand";
import { useCartStore } from "@/lib/cart";

const useBumpStore = create((set) => ({
  bump: false,
  trigger: () => {
    set({ bump: true });
    setTimeout(() => set({ bump: false }), 600);
  },
}));

export function useBump() {
  return useBumpStore((s) => s.bump);
}

/** Same signature as the original handleAdd(p): adds one, bumps the cart badge. */
export function useAddToCart() {
  const addItem = useCartStore((s) => s.addItem);
  const trigger = useBumpStore((s) => s.trigger);
  return (p) => {
    addItem({
      id: p.id,
      slug: p.slug,
      title: p.title,
      priceINR: p.priceINR,
      wasINR: p.wasINR,
      image: p.img,
      artVariant: p.artVariant,
      stockStatus: p.stockStatus,
    });
    trigger();
  };
}

/** Cart lines in the original shape ({ ...product, qty, img }). Empty until mounted (no hydration mismatch). */
export function useCartLines() {
  const items = useCartStore((s) => s.items);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return [];
  return items.map((i) => ({ ...i, qty: i.quantity, img: i.image }));
}

/**
 * Add-to-cart with a short inline confirmation. Returns { added, add, openCart }.
 * `added` stays true for ~2.6s so the button can read "Added · View cart".
 */
export function useAddWithFeedback(onAddOverride) {
  const addToCart = useAddToCart();
  const openCart = useCartStore((s) => s.openCart);
  const [added, setAdded] = useState(false);
  // True once the shopper has added this item: the label swap animates only
  // after that, never on first render.
  const [touched, setTouched] = useState(false);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  const add = (p) => {
    (onAddOverride || addToCart)(p);
    setAdded(true);
    setTouched(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 2600);
  };
  return { added, touched, add, openCart };
}
