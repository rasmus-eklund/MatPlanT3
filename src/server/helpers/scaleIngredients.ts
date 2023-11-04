import { tIngredient } from "~/zod/zodSchemas";

const scaleIngredients = <T extends tIngredient>(
  ingredients: T[],
  scale: number,
): T[] => {
  return ingredients.map((ingredient) => ({
    ...ingredient,
    quantity: ingredient.quantity * scale,
  }));
};

export default scaleIngredients;
