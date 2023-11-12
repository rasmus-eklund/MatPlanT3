"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Icon from "../icons/Icon";
import Button from "../Button";
import { useDebounce } from "usehooks-ts";

const SearchRecipeForm = () => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const router = useRouter();

  useEffect(() => {
    router.replace(`/recipes/search?search=${debouncedSearch}`);
  }, [debouncedSearch]);

  return (
    <div className="flex gap-2">
      <form
        onSubmit={(e) => {
          e.preventDefault();
        }}
        className="flex grow h-10 min-w-0 items-center justify-between rounded-md bg-c1 pl-2 text-xl"
      >
        <input
          className="min-w-0 whitespace-nowrap bg-c1 focus:outline-none"
          id="search"
          name="search"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={"Sök"}
        />
        <Icon className="h-10 fill-c3" icon="search" />
      </form>
      <Button
        className="shrink-0 h-10 px-2 whitespace-nowrap"
        onClick={() => router.push("/recipes/edit")}
        type="button"
      >
        Nytt recept
      </Button>
    </div>
  );
};

export default SearchRecipeForm;
