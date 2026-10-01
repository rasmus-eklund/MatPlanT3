"use client";

import Icon from "~/components/common/Icon";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuCheckboxItem,
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
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon">
            <Icon
              icon={value !== allItemsFilter ? "ListFilterPlus" : "ListFilter"}
              className="md:size-5"
            />
          </Button>
        }
      />
      <DropdownMenuContent className="w-full">
        <DropdownMenuGroup>
          <DropdownMenuCheckboxItem
            checked={value === allItemsFilter}
            onCheckedChange={() => onChange(allItemsFilter)}
          >
            Alla
          </DropdownMenuCheckboxItem>
          {hasNonRecipeItems && (
            <DropdownMenuCheckboxItem
              checked={value === nonRecipeItemsFilter}
              onCheckedChange={() => onChange(nonRecipeItemsFilter)}
            >
              Egna
            </DropdownMenuCheckboxItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Recept</DropdownMenuLabel>
          {items.map(({ name, id }) => (
            <DropdownMenuCheckboxItem
              key={id}
              checked={id === value}
              onCheckedChange={() => onChange(id)}
            >
              {name}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FilterSelect;
