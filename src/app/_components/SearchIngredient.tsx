"use client";
import { useState } from "react";
import { api } from "~/trpc/react";
import { useDebounce } from "usehooks-ts";
import { SearchIngredient } from "types";

type Props = { onSubmit: (ing: SearchIngredient) => void };

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
      {!!debouncedSearch && (
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

  onSelect: (ing: SearchIngredient) => void;
};
const Results = ({ search, onSelect }: ResultsProps) => {
  const {
    data: ingredients,
    isError,
    isSuccess,
  } = api.ingredient.search.useQuery({ search });

  return (
    <ul className="absolute top-10 w-full bg-c1">
      {isSuccess &&
        ingredients.map((ing) => (
          <li className={`px-2 hover:bg-c3`} key={ing.id}>
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
