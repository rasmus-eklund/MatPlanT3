"use client";
import { addItem, searchItem } from "~/server/api/items";
import StoreSelect from "./StoreSelect";
import DeleteCheckedItems from "./DeleteItems";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import ItemsCategory from "./ItemsCategory";
import SearchModal from "~/components/common/SearchModal";
import { type User } from "~/server/auth";
import FilterSelect from "./FilterItemsSelect";
import type { Stores, Store, Item, MenuItem } from "~/server/shared";
import { sortItemsByHomeAndChecked } from "~/lib/utils";
import { useState } from "react";
import type { SearchItemParams } from "~/types";

type Props = {
  items: Item[];
  user: User;
  store: Store;
  stores: Stores;
  // menu: MenuItem[];
  searchParams: SearchItemParams;
};

type Tab = "Köpa" | "Checkade" | "Hemma";
const ItemTabs = ({
  items,
  user,
  store,
  stores,
  // menu,
  searchParams,
}: Props) => {
  const [tab, setTab] = useState<Tab>("Köpa");
  const sorted = sortItemsByHomeAndChecked(items);
  const { store_categories: categories } = store;
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
          <StoreSelect stores={stores} defaultStoreId={store.id} />
          {/* <FilterSelect items={menu} searchParams={searchParams} /> */}
        </div>
        <h2 className="absolute left-1/2 -translate-x-1/2 text-lg font-bold">
          {tab}
        </h2>
        <div className="flex items-center gap-2">
          <DeleteCheckedItems items={items} user={user} />
          <SearchModal
            title="vara"
            addIcon
            onSearch={searchItem}
            onSubmit={async (item) => await addItem({ item, user })}
            user={user}
          />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 overflow-auto">
        <ItemContainer
          categories={categories}
          items={sorted.notHome}
          title="Köpa"
          user={user}
        />
        <ItemContainer
          categories={categories}
          items={sorted.checked}
          title="Checkade"
          user={user}
        />
        <ItemContainer
          categories={categories}
          items={sorted.home}
          title="Hemma"
          user={user}
        />
      </div>
    </Tabs>
  );
};

const ItemContainer = ({
  title,
  items,
  categories,
  user,
}: {
  title: string;
  items: Item[];
  categories: Store["store_categories"];
  user: User;
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
              user={user}
            />
          ))}
        </ul>
      )}
    </TabsContent>
  );
};

export default ItemTabs;
