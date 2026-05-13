"use client";

import Icon from "~/components/common/Icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { ItemStores } from "~/server/shared";
import { useShoppingItemsStore } from "~/stores/shopping-items-store";

type Props = {
  stores: ItemStores;
};

const StoreDropdown = ({ stores }: Props) => {
  const selectedStoreId = useShoppingItemsStore(
    (state) => state.selectedStoreId,
  );
  const setStoreId = useShoppingItemsStore((state) => state.setStoreId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button>
          <Icon icon="Store" className="md:size-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {stores.map((store) => (
          <DropdownMenuItem
            key={store.id}
            className={selectedStoreId === store.id ? "bg-c3" : ""}
            onSelect={() => setStoreId(store.id)}
          >
            {store.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default StoreDropdown;
