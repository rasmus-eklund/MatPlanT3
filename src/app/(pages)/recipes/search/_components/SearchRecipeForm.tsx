"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDebounce } from "usehooks-ts";
import Button from "~/app/_components/Button";
import Icon from "~/icons/Icon";
import { tSearchRecipeSchema } from "~/zod/zodSchemas";
import { formatUrl } from "../helpers/searchUrl";

type Props = { query: tSearchRecipeSchema };
const SearchRecipeForm = ({ query: { search: urlSearch, shared } }: Props) => {
  const [search, setSearch] = useState(urlSearch);
  const [isPublic, setIsPublic] = useState(shared === "true");
  const debouncedSearch = useDebounce(search, 500);
  const router = useRouter();

  useEffect(() => {
    if (debouncedSearch || shared !== (isPublic ? "true" : "false")) {
      const shared = isPublic ? "true" : "false";
      router.push(formatUrl({ search: debouncedSearch, page: 1, shared }));
    }
  }, [debouncedSearch, isPublic]);

  return (
    <div className="flex gap-2">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          router.push(formatUrl({ search: debouncedSearch, page: 1, shared }));
        }}
        className="flex h-10 min-w-0 grow items-center justify-between gap-2 rounded-md bg-c2 pl-1 text-xl"
      >
        <button
          type="button"
          className={`flex h-5 w-10 items-center rounded-lg border border-c5 px-[1px] ${
            isPublic ? "justify-end" : "justify-start"
          }`}
          onClick={() => setIsPublic((p) => !p)}
        >
          <div className="h-4 w-4 rounded-full bg-c4"></div>
        </button>
        <input
          className="min-w-0 grow whitespace-nowrap bg-c2 outline-none"
          id="search-form-search"
          name="search-form-search"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Sök ${isPublic ? "delat recept" : ""}`}
        />
        <Icon className="h-10 fill-c3" icon="search" />
      </form>
      <Button
        className="h-10 shrink-0 grow whitespace-nowrap px-2"
        onClick={() => router.push("/recipes/edit")}
        type="button"
      >
        Nytt recept
      </Button>
    </div>
  );
};

export default SearchRecipeForm;
