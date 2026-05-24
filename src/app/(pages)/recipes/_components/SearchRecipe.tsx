"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDebounceValue } from "usehooks-ts";
import Icon from "~/components/common/Icon";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { formatUrl } from "~/lib/utils";
import type { SearchRecipeParams } from "~/types";

type Props = {
  params: SearchRecipeParams;
};

const SearchRecipeForm = ({ params: incomingParams }: Props) => {
  const router = useRouter();
  const [params, setParams] = useState<SearchRecipeParams>(incomingParams);
  const [debouncedSearch] = useDebounceValue(params.search, 1000);

  useEffect(() => {
    if (debouncedSearch === incomingParams.search) return;

    router.push(
      formatUrl({
        ...params,
        page: 1,
        search: debouncedSearch,
      }),
    );
  }, [debouncedSearch, incomingParams.search, params, router]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <div className="bg-c2 relative flex h-10 min-w-0 flex-1 items-center rounded-md px-1 text-xl">
          <Input
            className="bg-c2 min-w-0 grow whitespace-nowrap outline-hidden"
            id="search-form-search"
            name="search-form-search"
            type="text"
            value={params.search}
            onChange={({ target: { value } }) =>
              setParams({ ...params, search: value })
            }
            placeholder="Sök"
          />
          {params.search && (
            <Button
              onClick={() => setParams({ ...params, search: "" })}
              variant="ghost"
              className="text-c3 absolute right-0"
            >
              <Icon icon="X" />
            </Button>
          )}
        </div>
        <DropDown />
      </div>
      <div className="flex gap-2">
        <Button
          className="flex-1"
          variant={params.shared ? "secondary" : "default"}
          onClick={() => {
            const nextParams = { ...params, page: 1, shared: false };
            setParams(nextParams);
            router.push(formatUrl(nextParams));
          }}
        >
          Dina recept
        </Button>
        <Button
          className="flex-1"
          variant={params.shared ? "default" : "secondary"}
          onClick={() => {
            const nextParams = { ...params, page: 1, shared: true };
            setParams(nextParams);
            router.push(formatUrl(nextParams));
          }}
        >
          Delade recept
        </Button>
      </div>
    </div>
  );
};

const DropDown = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="h-10" variant="default">
          Nytt recept
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem asChild>
          <Link
            className="w-full"
            href={"/recipes/new/empty"}
            data-cy="create-empty-recipe-link"
          >
            Tomt
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link className="w-full" href={"/recipes/new/link"}>
            Länk
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SearchRecipeForm;
