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
      className="relative flex gap-2"
    >
      <input
        className="h-10 min-w-0 rounded-md bg-c2 px-2 text-xl"
        id="search"
        name="search"
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={"Sök"}
      />
      <button className="absolute right-2 top-2" type="submit">
        <Icon className="" icon="search" />
      </button>
    </form>
  );
};

export default SearchRecipeForm;
