"use client";

import { useCart } from "@/lib/cartStore";

export default function AddToCartButton(props: {
  id: string;
  name: string;
  priceCents: number;
}) {
  const { items, addToCart, removeFromCart } = useCart();
  const item = items.find((i) => i.menuItemId === props.id);

  if (!item) {
    return (
      <button
        onClick={() =>
          addToCart({
            menuItemId: props.id,
            name: props.name,
            unitPriceCents: props.priceCents,
          })
        }
        className="rounded-full border px-3 py-1 text-sm hover:bg-zinc-50"
      >
        加入
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => addToCart(item, -1)}
        className="h-7 w-7 rounded-full border"
      >
        −
      </button>
      <span className="w-4 text-center text-sm">{item.qty}</span>
      <button
        onClick={() => addToCart(item, +1)}
        className="h-7 w-7 rounded-full border"
      >
        +
      </button>
    </div>
  );
}