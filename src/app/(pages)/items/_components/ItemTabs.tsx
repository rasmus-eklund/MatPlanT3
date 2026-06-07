"use client";
import { searchItem } from "~/server/api/items";
import StoreSelect from "./StoreSelect";
import DeleteCheckedItems from "./DeleteItems";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import ItemsCategory from "./ItemsCategory";
import SearchModal from "~/components/common/SearchModal";
import FilterSelect, {
  allItemsFilter,
  nonRecipeItemsFilter,
  type ItemFilter,
} from "./FilterItemsSelect";
import type { Item, ItemStores } from "~/server/shared";
import { sortItemsByHomeAndChecked } from "~/lib/utils";
import { useEffect, useState } from "react";
import { useShoppingItemsStore } from "~/stores/shopping-items-store";

type Props = {
  items: Item[];
  defaultStoreId: string;
  stores: ItemStores;
};

type Tab = "Köpa" | "Checkade" | "Hemma";
const ItemTabs = ({ items, defaultStoreId, stores }: Props) => {
  const [tab, setTab] = useState<Tab>("Köpa");
  const [itemFilter, setItemFilter] = useState<ItemFilter>(allItemsFilter);
  const storeItems = useShoppingItemsStore((state) => state.items);
  const initialized = useShoppingItemsStore((state) => state.initialized);
  const initialize = useShoppingItemsStore((state) => state.initialize);
  const flushPending = useShoppingItemsStore((state) => state.flushPending);
  const addItem = useShoppingItemsStore((state) => state.addItem);
  const selectedStoreId = useShoppingItemsStore(
    (state) => state.selectedStoreId,
  );
  const pending = useShoppingItemsStore((state) => state.pending);
  const lastSynced = useShoppingItemsStore((state) => state.lastSynced);

  useEffect(() => {
    initialize(items, defaultStoreId);
  }, [defaultStoreId, initialize, items]);

  useEffect(() => {
    const handleOnline = () => {
      void flushPending();
    };
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [flushPending]);

  const activeItems = initialized ? storeItems : items;
  const placementItems = activeItems.map((item) =>
    pending[item.id]
      ? { ...item, checked: lastSynced[item.id] ?? item.checked }
      : item,
  );
  const activeItemsById = new Map(activeItems.map((item) => [item.id, item]));
  const matchesFilter = (item: Item) => {
    if (itemFilter === allItemsFilter) {
      return true;
    }
    if (itemFilter === nonRecipeItemsFilter) {
      return !item.menuId;
    }
    return item.menuId === itemFilter;
  };
  const filteredActiveItems = activeItems.filter(matchesFilter);
  const filteredPlacementItems = placementItems.filter((item) =>
    matchesFilter(item),
  );
  const placementSorted = sortItemsByHomeAndChecked(filteredPlacementItems);
  const getActiveItems = (items: Item[]) =>
    items.map((item) => activeItemsById.get(item.id) ?? item);
  const sorted = {
    home: getActiveItems(placementSorted.home),
    notHome: getActiveItems(placementSorted.notHome),
    checked: getActiveItems(placementSorted.checked),
  };
  const menu = activeItems.reduce(
    (acc, i) => {
      if (i.menuId && !acc.find((m) => m.id === i.menuId)) {
        acc.push({ name: i.menu?.recipe.name ?? "Ingredienser", id: i.menuId });
      }
      return acc;
    },
    [] as { name: string; id: string }[],
  );
  const hasNonRecipeItems = activeItems.some((item) => !item.menuId);
  const selectedStore =
    stores.find((store) => store.id === selectedStoreId) ??
    stores.find((store) => store.id === defaultStoreId) ??
    stores[0];
  const categories = selectedStore?.store_categories ?? [];
  return (
    <Tabs
      className="flex h-full flex-col md:gap-1 md:pb-1"
      value={tab}
      onValueChange={(v) => setTab(v as Tab)}
    >
      <TabsList className="w-full shrink-0 rounded-none p-0 md:w-fit md:rounded-sm">
        <TabsTrigger value="Köpa">Köpa {sorted.notHome.length}</TabsTrigger>
        <TabsTrigger value="Checkade">
          Checkade {sorted.checked.length}
        </TabsTrigger>
        <TabsTrigger value="Hemma">Hemma {sorted.home.length}</TabsTrigger>
      </TabsList>
      <div className="bg-c2 text-c5 relative flex h-10 w-full shrink-0 items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <StoreSelect stores={stores} />
          <FilterSelect
            items={menu}
            hasNonRecipeItems={hasNonRecipeItems}
            value={itemFilter}
            onChange={setItemFilter}
          />
        </div>
        <h2 className="absolute left-1/2 -translate-x-1/2 text-lg font-bold">
          {tab}
        </h2>
        <div className="flex items-center gap-2">
          <DeleteCheckedItems items={filteredActiveItems} />
          <SearchModal
            title="vara"
            addIcon
            onSearch={searchItem}
            onSubmit={async (item) => addItem({ item })}
          />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 overflow-auto">
        <ItemContainer
          categories={categories}
          items={sorted.notHome}
          title="Köpa"
        />
        <ItemContainer
          categories={categories}
          items={sorted.checked}
          title="Checkade"
        />
        <ItemContainer
          categories={categories}
          items={sorted.home}
          title="Hemma"
        />
      </div>
    </Tabs>
  );
};

const ItemContainer = ({
  title,
  items,
  categories,
}: {
  title: string;
  items: Item[];
  categories: ItemStores[number]["store_categories"];
}) => {
  return (
    <TabsContent className="m-0 p-0" value={title}>
      {items.length === 0 ? (
        <div className="text-c5 flex h-52 flex-1 items-center justify-center">
          <p>Här var det tomt...</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {categories.map((category) => (
            <ItemsCategory
              key={category.id + title}
              category={category}
              items={items}
            />
          ))}
        </ul>
      )}
    </TabsContent>
  );
};

export default ItemTabs;
