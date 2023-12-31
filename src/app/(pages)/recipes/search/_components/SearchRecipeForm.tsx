"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDebounce } from "usehooks-ts";
import Button from "~/app/_components/Button";
import Icon from "~/icons/Icon";
import { tSearchRecipeSchema } from "~/zod/zodSchemas";
import { formatUrl } from "../helpers/searchUrl";
import Link from "next/link";

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
        <div className="flex items-center gap-1">
          <label className="w-10 text-xs text-c5" htmlFor="toggle-shared">
            {isPublic ? "Delade" : "Egna"}
          </label>
          <button
            type="button"
            id="toggle-shared"
            className={`flex h-5 w-10 items-center rounded-lg border border-c5 px-[1px] ${
              isPublic ? "justify-end" : "justify-start"
            }`}
            onClick={() => setIsPublic((p) => !p)}
          >
            <div className="h-4 w-4 rounded-full bg-c4"></div>
          </button>
        </div>
        <input
          className="min-w-0 grow whitespace-nowrap bg-c2 outline-none"
          id="search-form-search"
          name="search-form-search"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Sök"
        />
        <Icon className="h-10 fill-c3" icon="search" />
      </form>
      <DropDown />
    </div>
  );
};

const DropDown = () => {
  return (
    <div className="group relative flex flex-col pb-1">
      <Button className="h-10 shrink-0 grow whitespace-nowrap px-2">
        Nytt recept
      </Button>
      <ul className="absolute top-full hidden w-full flex-col gap-1 border border-c5 bg-c3 p-1 group-hover:flex">
        <li className="flex p-1 hover:bg-c4">
          <Link
            className="w-full"
            href={"/recipes/new/empty"}
            data-cy="create-empty-recipe-link"
          >
            Tomt
          </Link>
        </li>
        <li className="flex p-1 hover:bg-c4">
          <Link className="w-full" href={"/recipes/new/link"}>
            Länk
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default SearchRecipeForm;
