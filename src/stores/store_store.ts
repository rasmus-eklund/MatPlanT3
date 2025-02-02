import { type DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { action, makeObservable, observable, computed } from "mobx";
import { updateStoreOrder } from "~/server/api/stores";
import type { StoreWithItems } from "~/server/shared";

class StoreStore {
  originalCategories: StoreWithItems["store_categories"];
  categories: StoreWithItems["store_categories"];
  storeId: string;
  loading = false;
  open: string | null = null;

  constructor(categories: StoreWithItems["store_categories"], storeId: string) {
    makeObservable(this, {
      originalCategories: observable,
      categories: observable,
      storeId: observable,
      loading: observable,
      open: observable,
      setOpen: action,
      openIcon: computed,
      updateCategoryOrder: action,
      updateSubcategoryOrder: action,
      hasChanges: computed,
      moveSubcategoryItem: action,
      saveStoreOrder: action,
      resetStoreOrder: action,
    });
    this.categories = categories;
    this.originalCategories = categories;
    this.storeId = storeId;
  }

  setOpen = (open: string | null) => {
    this.open = open;
  };

  get openIcon() {
    return this.open === null ? "down" : "up";
  }

  updateCategoryOrder = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeIndex = this.categories.findIndex(
      (item) => item.id === active.id,
    );
    const overIndex = this.categories.findIndex((item) => item.id === over.id);
    if (activeIndex === -1 || overIndex === -1) return;
    this.categories = arrayMove(this.categories, activeIndex, overIndex).map(
      (i, order) => ({ ...i, order }),
    );
  };

  updateSubcategoryOrder = (event: DragEndEvent, categoryId: string) => {
    const { active, over } = event;
    if (!over) return;
    const categoryIndex = this.categories.findIndex(
      (item) => item.id === categoryId,
    );
    const category = this.categories[categoryIndex];
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
    this.categories[categoryIndex] = newCategory;
    if (this.hasChanges) {
    }
  };

  get hasChanges() {
    return this.categories.some((category, catIndex) => {
      if (category.id !== this.originalCategories[catIndex]?.id) {
        return true;
      }
      return category.store_subcategories.some(
        (subcategory, subIndex) =>
          subcategory.id !==
          this.originalCategories[catIndex]?.store_subcategories[subIndex]?.id,
      );
    });
  }

  moveSubcategoryItem = ({
    item,
    from,
    to,
  }: {
    item: StoreWithItems["store_categories"][number]["store_subcategories"][number];
    from: { categoryId: string };
    to: { categoryId: string };
  }) => {
    this.categories = this.categories.map((category, catOrder) => {
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
  };

  saveStoreOrder = async () => {
    this.loading = true;
    const changes = getChanges({
      originalItems: this.originalCategories,
      updatedItems: this.categories,
    });
    const data = { ...changes, storeId: this.storeId };
    const plain = JSON.parse(JSON.stringify(data)) as typeof data;
    await updateStoreOrder(plain);
    this.loading = false;
  };

  resetStoreOrder = () => {
    this.categories = this.originalCategories;
  };
}

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

export default StoreStore;
