import type { Item, StoreWithItems } from "~/server/shared";
import { groupItemsByName, sortBySubCategory } from "./utils";
import ItemsGroupedComponent from "./ItemsGrouped";

type ItemsCategoryProps = {
  items: Item[];
  category: StoreWithItems["store_categories"][number];
};
const ItemsCategory = async ({ category, items }: ItemsCategoryProps) => {
  const data = items.filter(
    (item) => item.ingredient.category.id === category.category.id,
  );
  if (data.length !== 0) {
    const grouped = groupItemsByName(data);
    const sorted = sortBySubCategory(category, grouped);
    return (
      <div className="bg-c5" key={category.id}>
        <h1 className="px-2 text-lg text-c1">
          {category.category.name.toUpperCase()}
        </h1>
        <ul className="flex flex-col gap-1">
          {sorted.map((item) => (
            <ItemsGroupedComponent key={item.name} group={item} />
          ))}
        </ul>
      </div>
    );
  }
};

export default ItemsCategory;
