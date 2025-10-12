import type { Item, Store } from "~/server/shared";
import { groupItemsByName, sortBySubCategory } from "./utils";
import ItemsGroupedComponent from "./ItemsGrouped";
import { type User } from "~/server/auth";

type ItemsCategoryProps = {
  items: Item[];
  category: Store["store_categories"][number];
  user: User;
};
const ItemsCategory = ({ category, items, user }: ItemsCategoryProps) => {
  const data = items.filter(
    (item) => item.ingredient.category.id === category.category.id,
  );
  if (data.length !== 0) {
    const grouped = groupItemsByName(data);
    const sorted = sortBySubCategory(category, grouped);
    return (
      <div className="bg-c5 px-1 py-2" key={category.id}>
        <h1 className="text-c1 px-2 text-lg">
          {category.category.name.toUpperCase()}
        </h1>
        <ul className="flex flex-col gap-1">
          {sorted.map((item) => (
            <ItemsGroupedComponent key={item.name} group={item} user={user} />
          ))}
        </ul>
      </div>
    );
  }
};

export default ItemsCategory;
