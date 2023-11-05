import type { CategoryItem } from "types";
import type { RouterOutputs } from "~/trpc/shared";
type Items = RouterOutputs["store"]["getById"]["order"];

export const groupSubcategoryByCategory = (items: Items): CategoryItem[] => {
  const start: CategoryItem[] = [];
  return items.reduce((acc, inputItem) => {
    const foundIndex = acc.findIndex(
      (item) => item.id === inputItem.category.id,
    );
    if (foundIndex === -1) {
      acc.push({
        ...inputItem.category,
        subcategories: [{ ...inputItem.subcategory }],
      });
    } else {
      acc[foundIndex]!.subcategories.push({
        ...inputItem.subcategory,
      });
    }
    return acc;
  }, start);
};
