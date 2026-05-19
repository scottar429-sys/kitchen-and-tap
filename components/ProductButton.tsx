"use client";

import { BarItem } from "./barBackTypes";

type ProductButtonProps = {
  item: BarItem;
  openCalculatorForItem: (item: BarItem) => void;
};

export default function ProductButton({
  item,
  openCalculatorForItem,
}: ProductButtonProps) {
  return (
    <button
      onClick={() => openCalculatorForItem(item)}
      className="font-bold text-left text-orange-800 hover:underline"
    >
      {item.productName}
    </button>
  );
}