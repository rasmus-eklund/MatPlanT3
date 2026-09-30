"use client";

import Icon from "~/components/common/Icon";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
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
        nativeButton={false}
        render={
          <Button
            nativeButton={false}
            variant="ghost"
            size="icon-xs"
            render={<Icon icon="Store" className="md:size-5" />}
          />
        }
      />
      <DropdownMenuContent>
        <DropdownMenuGroup>
          {stores.map((store) => (
            <DropdownMenuItem
              render={
                <div className="flex items-center gap-2">
                  <p className="text-nowrap">{store.name}</p>
                  {selectedStoreId === store.id && <Icon icon="Check" className="text-c3" />}
                </div>
              }
              key={store.id}
              onClick={() => setStoreId(store.id)}
            />
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default StoreDropdown;
