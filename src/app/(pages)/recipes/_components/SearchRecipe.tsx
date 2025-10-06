"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDebounceValue } from "usehooks-ts";
import Icon from "~/components/common/Icon";
import Link from "next/link";
import { Input } from "~/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import type { SearchRecipeParams } from "~/types";
import { formatUrl } from "~/lib/utils";

type Props = {
  params: SearchRecipeParams;
};
const SearchRecipeForm = (props: Props) => {
  const router = useRouter();
  const [params, setParams] = useState<SearchRecipeParams>(props.params);
  const [debouncedParams] = useDebounceValue(params, 1000);
  const updateParams = (newParams: SearchRecipeParams) => {
    setParams(newParams);
  };

  useEffect(() => {
    router.push(formatUrl(debouncedParams));
  }, [debouncedParams, router]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <div className="bg-c2 relative flex h-10 min-w-0 flex-1 items-center justify-between rounded-md px-1 text-xl">
          <Input
            className="bg-c2 min-w-0 grow whitespace-nowrap outline-hidden"
            id="search-form-search"
            name="search-form-search"
            type="text"
            value={params.search}
            onChange={({ target: { value } }) =>
              updateParams({ ...params, page: 1, search: value })
            }
            placeholder="Sök"
          />
          <Icon className="text-c3 absolute right-2 size-8" icon="Search" />
        </div>
        <DropDown />
      </div>
      <div className="flex gap-2">
        <Button
          className="w-full"
          variant={params.shared ? "secondary" : "default"}
          onClick={() => updateParams({ ...params, page: 1, shared: false })}
        >
          Dina recept
        </Button>
        <Button
          className="w-full"
          variant={params.shared ? "default" : "secondary"}
          onClick={() => updateParams({ ...params, page: 1, shared: true })}
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
        <Button variant="default">Nytt recept</Button>
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
