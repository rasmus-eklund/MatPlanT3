import type { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import type { Dispatch, SetStateAction } from "react";
import type { StoreWithItems } from "~/server/shared";

type SetItems = Dispatch<SetStateAction<StoreWithItems["store_categories"]>>;

export const categoryOnDragEnd = (event: DragEndEvent, setItems: SetItems) => {
  const { active, over } = event;
  if (over && active.id !== over.id) {
    setItems((items) => {
      const activeIndex = items.findIndex((item) => item.id === active.id);
      const overIndex = items.findIndex((item) => item.id === over.id);
      return arrayMove(items, activeIndex, overIndex).map((i, order) => ({
        ...i,
        order,
      }));
    });
  }
};

export const subcategoryOnDragEnd = (
  event: DragEndEvent,
  setItems: SetItems,
  categoryId: string,
) => {
  const { active, over } = event;
  if (over && active.id !== over.id) {
    setItems((items) => {
      const categoryIndex = items.findIndex((item) => item.id === categoryId);
      const category = items[categoryIndex];
      if (!category) {
        throw new Error("Could not find item");
      }
      const newSubcategories = arrayMove(
        category.store_subcategories,
        category.store_subcategories.findIndex((item) => item.id === active.id),
        category.store_subcategories.findIndex((item) => item.id === over.id),
      );
      const newCategory = {
        ...category,
        store_subcategories: newSubcategories.map((i, order) => ({
          ...i,
          order,
        })),
      };
      const newItems = [...items];
      newItems[categoryIndex] = newCategory;
      return newItems;
    });
  }
};

type Props = {
  from: { categoryId: string };
  item: StoreWithItems["store_categories"][number]["store_subcategories"][number];
  to: { categoryId: string };
  setItems: SetItems;
};

export const moveSubcategoryItem = ({ from, item, to, setItems }: Props) => {
  setItems((items) =>
    items.map((category, catOrder) => {
      if (category.id === from.categoryId) {
        return {
          ...category,
          store_subcategories: category.store_subcategories
            .filter((sub) => sub.id !== item.id)
            .map((item, order) => ({ ...item, order })),
        };
      }
      if (category.id === to.categoryId) {
        return {
          ...category,
          order: catOrder,
          store_subcategories: [
            { ...item, order: 0 },
            ...category.store_subcategories.map((item, order) => ({
              ...item,
              order: order + 1,
            })),
          ],
        };
      }
      return { ...category, order: catOrder };
    }),
  );
};

type GetChangesProps = {
  originalItems: StoreWithItems["store_categories"];
  updatedItems: StoreWithItems["store_categories"];
};
export const getChanges = ({
  originalItems,
  updatedItems,
}: GetChangesProps) => {
  const changedCategories: StoreWithItems["store_categories"] = [];
  const changedSubcategories: (StoreWithItems["store_categories"][number]["store_subcategories"][number] & {
    categoryId: string;
  })[] = [];

  for (const category of updatedItems) {
    const originalCategory = originalItems.find(
      (item) => item.id === category.id,
    );
    if (!originalCategory) {
      throw new Error("Not found");
    }
    if (originalCategory.order !== category.order) {
      changedCategories.push(category);
    }
    for (const subcategory of category.store_subcategories) {
      const originalSubcategory = originalCategory.store_subcategories.find(
        (item) => item.id === subcategory.id,
      );
      if (!originalSubcategory) {
        changedSubcategories.push({ ...subcategory, categoryId: category.id });
      } else if (
        originalSubcategory.order !== subcategory.order ||
        originalSubcategory.id !== subcategory.id
      ) {
        changedSubcategories.push({ ...subcategory, categoryId: category.id });
      }
    }
  }
  if (changedCategories.length !== 0 || changedSubcategories.length !== 0) {
    return {
      categories: changedCategories,
      subcategories: changedSubcategories,
    };
  }
};
