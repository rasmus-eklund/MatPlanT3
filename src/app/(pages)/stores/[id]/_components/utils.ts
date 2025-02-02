import { type DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { type StoreWithItems } from "~/server/shared";

export const updateCategoryOrder = (
  event: DragEndEvent,
  categories: StoreWithItems["store_categories"],
) => {
  const { active, over } = event;
  if (!over) return;
  const activeIndex = categories.findIndex((item) => item.id === active.id);
  const overIndex = categories.findIndex((item) => item.id === over.id);
  if (activeIndex === -1 || overIndex === -1) return;
  return arrayMove(categories, activeIndex, overIndex).map((i, order) => ({
    ...i,
    order,
  }));
};

export const updateSubcategoryOrder = (
  event: DragEndEvent,
  categoryId: string,
  categories: StoreWithItems["store_categories"],
) => {
  const { active, over } = event;
  if (!over) return;
  const categoryIndex = categories.findIndex((item) => item.id === categoryId);
  const category = categories[categoryIndex];
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
  const newCategories = [...categories];
  newCategories[categoryIndex] = newCategory;
  return newCategories;
};

export const hasChanges = (
  categories: StoreWithItems["store_categories"],
  originalCategories: StoreWithItems["store_categories"],
) => {
  return categories.some((category, catIndex) => {
    if (category.id !== originalCategories[catIndex]?.id) {
      return true;
    }
    return category.store_subcategories.some(
      (subcategory, subIndex) =>
        subcategory.id !==
        originalCategories[catIndex]?.store_subcategories[subIndex]?.id,
    );
  });
};

type MoveSubcategoryItemProps = {
  item: StoreWithItems["store_categories"][number]["store_subcategories"][number];
  from: { categoryId: string };
  to: { categoryId: string };
  categories: StoreWithItems["store_categories"];
};

export const moveSubcategoryItem = ({
  item,
  from,
  to,
  categories,
}: MoveSubcategoryItemProps) =>
  categories.map((category, catOrder) => {
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
  });

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
  return {
    categories: changedCategories,
    subcategories: changedSubcategories,
  };
};
