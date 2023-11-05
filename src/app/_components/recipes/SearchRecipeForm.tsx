"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Icon from "../icons/Icon";

const SearchRecipeForm = () => {
  const [search, setSearch] = useState("");
  const router = useRouter();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        router.replace(`/recipes/search?search=${search}`);
      }}
      className="flex h-10 grow gap-2 rounded-md bg-c1 px-2 text-xl"
    >
      <input
        className="min-w-0 grow bg-c1 focus:outline-none"
        id="search"
        name="search"
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={"Sök"}
      />
      <button type="submit">
        <Icon className="h-8 w-8 fill-c3 hover:fill-c5" icon="search" />
      </button>
    </form>
  );
};

export default SearchRecipeForm;
