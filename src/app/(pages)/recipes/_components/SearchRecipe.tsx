"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDebounceValue } from "usehooks-ts";
import Icon from "~/icons/Icon";
import Link from "next/link";
import { Switch } from "~/components/ui/switch";
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

const SearchRecipeForm = () => {
  const router = useRouter();
  const [params, setParams] = useState<SearchRecipeParams>({
    search: "",
    shared: false,
    page: 1,
  });

  const [debouncedParams] = useDebounceValue(params, 500);
  useEffect(() => {
    router.push(formatUrl(debouncedParams));
  }, [debouncedParams, router]);

  return (
    <div className="flex gap-2">
      <div className="flex h-10 min-w-0 grow items-center justify-between gap-2 rounded-md bg-c2 px-4 text-xl">
        <div className="flex items-center gap-1">
          <label className="w-10 text-xs text-c5" htmlFor="toggle-shared">
            Delade
          </label>
          <Switch
            checked={params.shared}
            onCheckedChange={(checked) =>
              setParams((p) => ({ ...p, shared: checked }))
            }
            id="toggle-shared"
          />
        </div>
        <Input
          className="min-w-0 grow whitespace-nowrap bg-c2 outline-none"
          id="search-form-search"
          name="search-form-search"
          type="text"
          value={params.search}
          onChange={({ target: { value } }) =>
            setParams((p) => ({ ...p, search: value }))
          }
          placeholder="Sök"
        />
        <Icon className="size-10 fill-c3" icon="search" />
      </div>
      <DropDown />
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
        <DropdownMenuItem asChild disabled>
          <Link className="w-full" href={"/recipes/new/link"}>
            Länk
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SearchRecipeForm;
