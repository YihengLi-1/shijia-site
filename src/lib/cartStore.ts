// src/lib/cartStore.ts
"use client";

import { useSyncExternalStore } from "react";

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

// ✅ 关键：缓存 snapshot 引用，避免每次 render 都 new 一个数组导致无限循环
let hydrated = false;
let state: CartState = { items: {} };
let snapshot: CartItem[] = [];
const SERVER_SNAPSHOT: CartItem[] = []; // ✅ server snapshot 必须是稳定引用

function hydrateOnce() {
  if (hydrated) return;
  hydrated = true;

  if (typeof window === "undefined") {
    state = { items: {} };
    snapshot = [];
    return;
  }

  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as CartState;
      if (parsed && parsed.items && typeof parsed.items === "object") {
        state = { items: parsed.items };
      }
    }
  } catch {
    state = { items: {} };
  }

  snapshot = Object.values(state.items);
}

function persistAndBroadcast() {
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(state));
  }
  // ✅ 更新 snapshot 引用（只有这里会变）
  snapshot = Object.values(state.items);
  bus.dispatchEvent(new Event("change"));
}

export function getCart(): CartItem[] {
  hydrateOnce();
  return snapshot; // ✅ 稳定引用
}

export function addToCart(input: Omit<CartItem, "qty">, delta = 1) {
  hydrateOnce();

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

  persistAndBroadcast();
}

export function removeFromCart(menuItemId: string) {
  hydrateOnce();
  delete state.items[menuItemId];
  persistAndBroadcast();
}

export function clearCart() {
  hydrateOnce();
  state = { items: {} };
  persistAndBroadcast();
}

export function cartTotalCents(): number {
  const items = getCart();
  return items.reduce((sum, it) => sum + it.unitPriceCents * it.qty, 0);
}

// ✅ React hook：订阅购物车变化（不再无限循环）
export function useCart() {
  const items = useSyncExternalStore(
    (cb) => {
      const handler = () => cb();
      bus.addEventListener("change", handler);
      return () => bus.removeEventListener("change", handler);
    },
    () => getCart(),          // ✅ client snapshot（稳定引用）
    () => SERVER_SNAPSHOT     // ✅ server snapshot（稳定引用）
  );

  return {
    items,
    totalCents: items.reduce((sum, it) => sum + it.unitPriceCents * it.qty, 0),
    addToCart,
    removeFromCart,
    clearCart,
  };
}