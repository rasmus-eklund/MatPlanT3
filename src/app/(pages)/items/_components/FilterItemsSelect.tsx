import Link from "next/link";
import Icon from "~/components/common/Icon";
import type { MenuItem } from "~/server/shared";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { SearchItemParams } from "~/types";

type Props = {
  items: MenuItem[];
  searchParams?: SearchItemParams;
};

const FilterSelect = ({ items, searchParams }: Props) => {
  const store = searchParams?.store;
  const menuIdSearch = searchParams?.menuId;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button>
          <Icon
            icon={menuIdSearch ? "ListFilterPlus" : "ListFilter"}
            className={"md:size-5"}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem asChild>
          <Link
            className={!menuIdSearch ? "bg-c3" : ""}
            href={getHref({ store })}
          >
            Alla
          </Link>
        </DropdownMenuItem>
        {items.map(({ id, recipe: { name } }) => (
          <DropdownMenuItem key={id} asChild>
            <Link
              className={id === menuIdSearch ? "bg-c3" : ""}
              href={getHref({ store, menuId: id })}
            >
              {name}
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem asChild>
          <Link
            className={menuIdSearch === "nonRecipeItems" ? "bg-c3" : ""}
            href={getHref({ store, menuId: "nonRecipeItems" })}
          >
            Ingredienser
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const getHref = (searchParams: SearchItemParams) => {
  if (!searchParams) return "";
  const { store, menuId } = searchParams;
  return `/items?${store ? `store=${store}&` : ""}${menuId ? `menuId=${menuId}` : ""}`;
};

export default FilterSelect;
