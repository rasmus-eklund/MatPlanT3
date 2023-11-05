"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Icon from "../icons/Icon";
import Button from "../Button";

const SearchRecipeForm = () => {
  const [search, setSearch] = useState("");
  const router = useRouter();

  return (
    <div className="flex gap-2">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          router.replace(`/recipes/search?search=${search}`);
        }}
        className="flex min-w-0 h-10 items-center justify-between rounded-md bg-c1 pl-2 text-xl"
      >
        <input
          className="min-w-0 bg-c1 focus:outline-none"
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
      <Button className="h-10 w-32" onClick={() => router.push("/recipes/edit")} type="button">
        Nytt recept
      </Button>
    </div>
  );
};

export default SearchRecipeForm;
