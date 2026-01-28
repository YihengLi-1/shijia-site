// src/lib/cartStore.ts
"use client";

export type CartItem = {
  menuItemId: string;
  name: string;
  unitPriceCents: number;
  qty: number;
};

type CartState = {
  items: Record<string, CartItem>;
};

const KEY = "shijia_cart_v1";
const bus = new EventTarget();

function read(): CartState {
  if (typeof window === "undefined") return { items: {} };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { items: {} };
    const parsed = JSON.parse(raw) as CartState;
    return parsed?.items ? parsed : { items: {} };
  } catch {
    return { items: {} };
  }
}

function write(state: CartState) {
  localStorage.setItem(KEY, JSON.stringify(state));
  bus.dispatchEvent(new Event("change"));
}

export function getCart(): CartItem[] {
  const state = read();
  return Object.values(state.items);
}

export function addToCart(input: Omit<CartItem, "qty">, delta = 1) {
  const state = read();
  const cur = state.items[input.menuItemId];
  const nextQty = (cur?.qty ?? 0) + delta;

  if (nextQty <= 0) {
    delete state.items[input.menuItemId];
  } else {
    state.items[input.menuItemId] = {
      menuItemId: input.menuItemId,
      name: input.name,
      unitPriceCents: input.unitPriceCents,
      qty: nextQty,
    };
  }

  write(state);
}

export function removeFromCart(menuItemId: string) {
  const state = read();
  delete state.items[menuItemId];
  write(state);
}

export function clearCart() {
  write({ items: {} });
}

export function cartTotalCents(): number {
  return getCart().reduce((sum, it) => sum + it.unitPriceCents * it.qty, 0);
}

// React hook：任意页面都能订阅购物车变化
import { useSyncExternalStore } from "react";

export function useCart() {
  const items = useSyncExternalStore(
    (cb) => {
      const handler = () => cb();
      bus.addEventListener("change", handler);
      return () => bus.removeEventListener("change", handler);
    },
    () => getCart(),
    () => []
  );

  return {
    items,
    totalCents: items.reduce((sum, it) => sum + it.unitPriceCents * it.qty, 0),
    addToCart,
    removeFromCart,
    clearCart,
  };
}