import Link from "next/link";
import Icon from "~/components/common/Icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { Stores } from "~/server/shared";

type Props = {
  stores: Stores;
  defaultStoreId: string;
};

const StoreDropdown = ({ stores, defaultStoreId }: Props) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button>
        <Icon icon="Store" className="md:size-5" />
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      {stores.map((store) => (
        <DropdownMenuItem key={store.id} asChild>
          <Link
            className={defaultStoreId === store.id ? "bg-c3" : ""}
            href={`/items?store=${store.slug}`}
          >
            {store.name}
          </Link>
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
);

export default StoreDropdown;
