import type { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import type { Dispatch, SetStateAction } from "react";
import type { CategoryItem } from "~/types";

type SetItems = Dispatch<SetStateAction<CategoryItem[]>>;

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
        category.subcategories,
        category.subcategories.findIndex((item) => item.id === active.id),
        category.subcategories.findIndex((item) => item.id === over.id),
      );
      const newCategory = {
        ...category,
        subcategories: newSubcategories.map((i, order) => ({ ...i, order })),
      };
      const newItems = [...items];
      newItems[categoryIndex] = newCategory;
      return newItems;
    });
  }
};

type Props = {
  from: { categoryId: string; subcategoryId: string; subcategoryName: string };
  to: { categoryId: string };
  setItems: SetItems;
};

export const moveSubcategoryItem = ({ from, to, setItems }: Props) => {
  setItems((items) =>
    items.map((item, catOrder) => {
      if (item.id === from.categoryId) {
        return {
          ...item,
          subcategories: item.subcategories
            .filter((sub) => sub.id !== from.subcategoryId)
            .map((item, order) => ({ ...item, order })),
        };
      }
      if (item.id === to.categoryId) {
        return {
          ...item,
          order: catOrder,
          subcategories: [
            {
              id: from.subcategoryId,
              name: from.subcategoryName,
              order: 0,
            },
            ...item.subcategories.map((item, order) => ({
              ...item,
              order: order + 1,
            })),
          ],
        };
      }
      return { ...item, order: catOrder };
    }),
  );
};

type GetChangesProps = {
  originalItems: CategoryItem[];
  updatedItems: CategoryItem[];
};
export const getChanges = ({
  originalItems,
  updatedItems,
}: GetChangesProps) => {
  const changedCategories: CategoryItem[] = [];
  const changedSubcategories: (CategoryItem["subcategories"][number] & {
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
    for (const subcategory of category.subcategories) {
      const originalSubcategory = originalCategory.subcategories.find(
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
