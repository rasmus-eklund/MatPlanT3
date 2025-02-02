"use client";
import StoreStore from "~/stores/store_store";
import SortableCategories from "./SortableCategories";
import { type StoreWithItems } from "~/server/shared";

type Props = {
  store_categories: StoreWithItems["store_categories"];
  storeId: string;
};
const SortableWrapper = ({ store_categories, storeId }: Props) => {
  const store = new StoreStore(store_categories, storeId);
  return <SortableCategories store={store} />;
};

export default SortableWrapper;
