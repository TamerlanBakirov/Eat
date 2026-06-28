"use client";

import { useAppStore } from "@/lib/store";
import { Card } from "./ui";

export function ShoppingTab() {
  const shoppingList = useAppStore((s) => s.shoppingList);
  const toggle = useAppStore((s) => s.toggleShoppingItem);

  const remaining = shoppingList.filter((i) => !i.checked).length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">Alışveriş Listesi</h1>
        <p className="text-sm text-slate-500">
          Öğün planından otomatik oluşturuldu
        </p>
      </div>

      {shoppingList.length === 0 ? (
        <Card className="py-10 text-center text-sm text-slate-400">
          Önce bir öğün planı oluştur, market listen burada belirsin. 🛒
        </Card>
      ) : (
        <>
          <p className="text-sm text-slate-500">
            {remaining} ürün kaldı · {shoppingList.length} toplam
          </p>
          <Card className="divide-y divide-slate-100 p-0">
            {shoppingList.map((item, i) => (
              <button
                key={i}
                onClick={() => toggle(i)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left"
              >
                <span
                  className={
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 " +
                    (item.checked
                      ? "border-brand-600 bg-brand-600 text-white"
                      : "border-slate-300")
                  }
                >
                  {item.checked && "✓"}
                </span>
                <span className="flex-1">
                  <span
                    className={
                      "text-sm font-medium " +
                      (item.checked
                        ? "text-slate-400 line-through"
                        : "text-slate-800")
                    }
                  >
                    {item.name}
                  </span>
                </span>
                <span className="text-xs text-slate-400">{item.amount}</span>
              </button>
            ))}
          </Card>
        </>
      )}
    </div>
  );
}
