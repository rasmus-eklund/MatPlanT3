"use client";
import { useState } from "react";
import { api } from "~/trpc/react";
import { useDebounce } from "usehooks-ts";
import { MeilIngredient } from "types";

type Props = { onSubmit: (ing: MeilIngredient) => void };

const SearchIngredients = ({ onSubmit }: Props) => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  return (
    <section className="relative flex flex-col align-middle">
      <input
        className="w-full rounded-md bg-c2 px-4 py-2 outline-none focus:bg-c1"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Lägg till vara..."
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
          }
        }}
        autoComplete="off"
      />
      {!!debouncedSearch && !!search && (
        <Results
          search={debouncedSearch}
          onSelect={(ing) => {
            setSearch("");
            onSubmit(ing);
          }}
        />
      )}
    </section>
  );
};

type ResultsProps = {
  search: string;
  onSelect: (ing: MeilIngredient) => void;
};
const Results = ({ search, onSelect }: ResultsProps) => {
  const {
    data: ingredients,
    isError,
    isSuccess,
  } = api.ingredient.search.useQuery({ search });

  return (
    <ul className="absolute top-10 z-50 w-full bg-c1">
      {isSuccess &&
        ingredients.map((ing) => (
          <li
            className={`cursor-pointer px-2 md:hover:bg-c3`}
            key={ing.ingredientId}
          >
            <p
              onClick={() => {
                onSelect(ing);
              }}
            >
              {ing.name}
            </p>
          </li>
        ))}
      {isError && <li>Error</li>}
    </ul>
  );
};

export default SearchIngredients;
