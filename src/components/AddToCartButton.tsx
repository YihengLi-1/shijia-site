"use client";

import { useState } from "react";
import { useCart } from "@/lib/cartStore";

export default function AddToCartButton(props: {
  id: string;
  name: string;
  priceCents: number;
}) {
  const { items, addToCart } = useCart();
  const item = items.find((i) => i.menuItemId === props.id);
  const [bumpKey, setBumpKey] = useState(0);

  if (!item) {
    return (
      <button
        onClick={() => {
          addToCart({
            menuItemId: props.id,
            name: props.name,
            unitPriceCents: props.priceCents,
          });
          setBumpKey((k) => k + 1);
        }}
        className="rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-800 hover:border-zinc-400 pressable focus-ring"
      >
        加入供斋
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => {
          addToCart(item, -1);
          setBumpKey((k) => k + 1);
        }}
        className="h-7 w-7 rounded-full border border-zinc-300 bg-white text-sm font-semibold hover:border-zinc-400 pressable focus-ring"
      >
        −
      </button>
      <span
        key={bumpKey}
        className="w-4 text-center text-sm font-medium bump"
      >
        {item.qty}
      </span>
      <button
        onClick={() => {
          addToCart(item, +1);
          setBumpKey((k) => k + 1);
        }}
        className="h-7 w-7 rounded-full border border-zinc-300 bg-white text-sm font-semibold hover:border-zinc-400 pressable focus-ring"
      >
        +
      </button>
    </div>
  );
}
