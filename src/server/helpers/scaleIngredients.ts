
const scaleIngredients = <T extends { quantity: number }>(
  ingredients: T[],
  scale: number,
): T[] => {
  return ingredients.map((ingredient) => ({
    ...ingredient,
    quantity: ingredient.quantity * scale,
  }));
};

export default scaleIngredients;
