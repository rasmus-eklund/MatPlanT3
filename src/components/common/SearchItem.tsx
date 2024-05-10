"use client";
import { useState, useEffect } from "react";
import { useDebounceValue } from "usehooks-ts";
import type { MeilIngredient } from "~/types";
import { Input } from "../ui/input";
import { searchItem } from "~/server/api/items";
import { toast } from "sonner";

type Props = { onSubmit: (ing: MeilIngredient) => void; title?: string };

const SearchItem = ({ onSubmit, title = "Lägg till vara..." }: Props) => {
  const [search, setSearch] = useState("");
  const [debounced] = useDebounceValue(search, 500);
  const [selected, setSelected] = useState(0);
  const [items, setItems] = useState<MeilIngredient[]>([]);

  const onKeyDown = (key: string) => {
    if (key === "Enter") {
      const ing = items[selected];
      if (ing) {
        setSearch("");
        setItems([]);
        onSubmit(ing);
      }
    }
    if (key === "ArrowDown") {
      setSelected((p) => {
        if (p === items.length - 1) {
          return p;
        }
        return p + 1;
      });
    }
    if (key === "ArrowUp") {
      setSelected((p) => {
        if (p === 0) {
          return p;
        }
        return p - 1;
      });
    }
    if (key === "Escape") {
      setSelected(0);
      setItems([]);
      setSearch("");
    }
  };

  useEffect(() => {
    if (debounced) {
      searchItem(debounced)
        .then((items) => setItems(items))
        .catch(() => toast.error("Något gick fel..."));
    } else {
      setItems([]);
    }
  }, [debounced]);

  return (
    <section className="relative flex flex-col items-center">
      <Input
        className="w-full rounded-md bg-c2 px-4 py-2 outline-none focus:bg-c1"
        value={search}
        onChange={({ target: { value } }) => setSearch(value)}
        placeholder={title}
        onKeyDown={({ key }) => onKeyDown(key)}
        autoComplete="off"
      />
      {items.length !== 0 && (
        <ul className="absolute top-full z-50 w-full rounded-md border border-c5 bg-c1">
          {items.map((ing, i) => (
            <li
              className={`cursor-pointer px-2 md:hover:bg-c3 ${
                selected === i && "bg-c4 text-c1"
              } ${i === 0 && "rounded-t-md"}`}
              key={ing.ingredientId}
            >
              <p
                onClick={() => {
                  onSubmit(ing);
                  setSearch("");
                  setItems([]);
                }}
              >
                {ing.name}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default SearchItem;
