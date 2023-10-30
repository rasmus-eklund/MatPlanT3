"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "../buttons/Button";

const SearchRecipeForm = () => {
  const [search, setSearch] = useState("");
  const router = useRouter();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        router.replace(`/recipes/search?search=${search}`);
      }}
      className="flex flex-col gap-2"
    >
      <div className="flex gap-2">
        <input
          className="h-10 rounded-md bg-c2 px-2 text-xl min-w-0"
          id="search"
          name="search"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={"Sök"}
        />
        <Button className="w-20" type="submit">
          Sök
        </Button>
      </div>
    </form>
  );
};

export default SearchRecipeForm;
