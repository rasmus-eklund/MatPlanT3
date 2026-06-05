import type { Recipe } from "~/server/shared";

export const createCopy = (recipeId: string, recipe: Recipe) => {
  const { instruction, name, quantity, unit, groups } = recipe;
  const newIngredients: Recipe["groups"][number]["ingredients"] = [];
  const newGroups = groups.map(({ name, order, ingredients }) => {
    const groupId = crypto.randomUUID();
    for (const ingredient of ingredients) {
      newIngredients.push({
        ...ingredient,
        groupId,
        id: crypto.randomUUID(),
      });
    }
    return {
      id: groupId,
      name,
      order,
      recipeId,
    };
  });

  return {
    newRecipe: { name, quantity, unit, instruction, id: recipeId },
    newIngredients,
    newGroups,
  };
};
