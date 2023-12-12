"use client";
import { useState } from "react";
import { api } from "~/trpc/react";
import { useDebounce } from "usehooks-ts";
import { MeilIngredient } from "types";

type Props = { onSubmit: (ing: MeilIngredient) => void };

const SearchIngredients = ({ onSubmit }: Props) => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [selected, setSelected] = useState(0);
  const {
    data: ingredients,
    isError,
    isSuccess,
  } = api.ingredient.search.useQuery(
    { search: debouncedSearch },
    { enabled: !!debouncedSearch },
  );
  return (
    <section className="relative flex flex-col items-center">
      <input
        className="w-full rounded-md bg-c2 px-4 py-2 outline-none focus:bg-c1"
        value={search}
        onChange={({ target: { value } }) => setSearch(value)}
        placeholder="Lägg till vara..."
        onKeyDown={({ key }) => {
          if (isSuccess) {
            if (key === "Enter") {
              const ing = ingredients[selected];
              if (ing) {
                setSearch("");
                onSubmit(ing);
              }
            }
            switch (key) {
              case "ArrowDown":
                setSelected((p) => {
                  if (p === ingredients.length - 1) {
                    return p;
                  }
                  return p + 1;
                });
                break;
              case "ArrowUp":
                setSelected((p) => {
                  if (p === 0) {
                    return p;
                  }
                  return p - 1;
                });
                break;

              default:
                break;
            }
          }
        }}
        autoComplete="off"
      />
      {isSuccess && !!debouncedSearch && (
        <ul className="absolute top-full z-50 w-full rounded-md border border-c5 bg-c1">
          {ingredients.map((ing, i) => (
            <li
              className={`cursor-pointer px-2 md:hover:bg-c3 ${
                selected === i && "bg-c4 text-c1"
              } ${i === 0 && "rounded-t-md"}`}
              key={ing.ingredientId}
            >
              <p
                onClick={() => {
                  setSearch("");
                  onSubmit(ing);
                }}
              >
                {ing.name}
              </p>
            </li>
          ))}
        </ul>
      )}
      {isError && (
        <p className="w-full rounded-md border border-c5 bg-c1 p-1 text-c5">
          Något gick fel...
        </p>
      )}
    </section>
  );
};

export default SearchIngredients;
