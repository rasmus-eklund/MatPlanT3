import type { Item, StoreWithItems } from "~/server/shared";
import ItemsCategory from "./ItemsCategory";

const ItemContainer = ({
  title,
  items,
  categories,
}: {
  title: string;
  items: Item[];
  categories: StoreWithItems["store_categories"];
}) => {
  if (items.length !== 0) {
    return (
      <div>
        <h2 className="rounded-md bg-c2 p-1 text-center text-lg font-bold text-c5">
          {title}
        </h2>
        <ul className="flex flex-col gap-1 rounded-md bg-c5 p-1">
          {categories.map((category) => (
            <ItemsCategory
              key={category.id + title}
              category={category}
              items={items}
            />
          ))}
        </ul>
      </div>
    );
  }
};

export default ItemContainer;
