"use client";
import { useEffect, useState } from "react";
import { useDebounceValue } from "usehooks-ts";
import type { MeilIngredient } from "~/types";
import { Input } from "../ui/input";
import { searchItem } from "~/server/api/items";

type Props = { onSubmit: (ing: MeilIngredient) => void; title?: string };

const SearchItem = ({ onSubmit, title = "Lägg till vara..." }: Props) => {
  const [search, setSearch] = useDebounceValue("", 500);
  const [selected, setSelected] = useState(0);
  const [items, setItems] = useState<MeilIngredient[]>([]);
  const [error, setError] = useState<null | string>(null);

  useEffect(() => {
    if (!search) {
      setItems([]);
    } else {
      searchItem(search)
        .then((items) => setItems(items))
        .catch(() => setError("Något gick fel"));
    }
  }, [search]);

  const onKeyDown = (key: string) => {
    if (key === "Enter") {
      const ing = items[selected];
      if (ing) {
        onSubmit(ing);
        setSearch("");
        setItems([]);
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

  return (
    <section className="relative flex flex-col items-center">
      <Input
        className="w-full rounded-md bg-c2 px-4 py-2 outline-none focus:bg-c1"
        onChange={({ target: { value } }) => setSearch(value)}
        placeholder={title}
        onKeyDown={({ key }) => onKeyDown(key)}
        autoComplete="off"
      />
      {error ? (
        <p>{error}</p>
      ) : (
        items.length !== 0 && (
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
        )
      )}
    </section>
  );
};

export default SearchItem;
