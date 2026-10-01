"use client";

import Icon from "~/components/common/Icon";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { ItemStores } from "~/server/shared";
import { useShoppingItemsStore } from "~/stores/shopping-items-store";

type Props = {
  stores: ItemStores;
};

const StoreDropdown = ({ stores }: Props) => {
  const selectedStoreId = useShoppingItemsStore((state) => state.selectedStoreId);
  const setStoreId = useShoppingItemsStore((state) => state.setStoreId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon">
            <Icon icon="Store" className="md:size-5" />
          </Button>
        }
      />
      <DropdownMenuContent className="w-full">
        <DropdownMenuGroup>
          {stores.map((store) => (
            <DropdownMenuCheckboxItem
              key={store.id}
              checked={selectedStoreId === store.id}
              onCheckedChange={() => setStoreId(store.id)}
            >
              {store.name}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default StoreDropdown;
