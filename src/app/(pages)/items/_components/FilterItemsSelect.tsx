"use client";

import Icon from "~/components/common/Icon";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

export const allItemsFilter = "all";
export const nonRecipeItemsFilter = "nonRecipeItems";
export type ItemFilter = string;

type Props = {
  items: { name: string; id: string }[];
  hasNonRecipeItems: boolean;
  value: ItemFilter;
  onChange: (value: ItemFilter) => void;
};

const FilterSelect = ({ items, hasNonRecipeItems, value, onChange }: Props) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Icon
            icon={value !== allItemsFilter ? "ListFilterPlus" : "ListFilter"}
            className="md:size-5"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          className={value === allItemsFilter ? "bg-c3" : ""}
          onSelect={() => onChange(allItemsFilter)}
        >
          Alla
        </DropdownMenuItem>
        {hasNonRecipeItems && (
          <DropdownMenuItem
            className={value === nonRecipeItemsFilter ? "bg-c3" : ""}
            onSelect={() => onChange(nonRecipeItemsFilter)}
          >
            Egna
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Recept</DropdownMenuLabel>
          {items.map(({ name, id }) => (
            <DropdownMenuItem
              key={id}
              className={id === value ? "bg-c3" : ""}
              onSelect={() => onChange(id)}
            >
              {name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FilterSelect;
