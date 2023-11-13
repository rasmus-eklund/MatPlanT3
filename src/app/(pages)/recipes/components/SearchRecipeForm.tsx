"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useDebounce } from "usehooks-ts";
import Button from "~/app/_components/Button";
import Icon from "~/app/assets/icons/Icon";

const SearchRecipeForm = () => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const router = useRouter();

  useEffect(() => {
    if (debouncedSearch) {
      router.push(`/recipes/search?search=${debouncedSearch}`);
    }
  }, [debouncedSearch]);

  return (
    <div className="flex gap-2">
      <form
        onSubmit={(e) => {
          e.preventDefault();
        }}
        className="flex h-10 min-w-0 grow items-center justify-between rounded-md bg-c1 pl-2 text-xl"
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
        className="h-10 shrink-0 whitespace-nowrap px-2"
        onClick={() => router.push("/recipes/edit")}
        type="button"
      >
        Nytt recept
      </Button>
    </div>
  );
};

export default SearchRecipeForm;
