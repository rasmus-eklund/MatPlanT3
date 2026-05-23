export const recipePageLimits = [10, 20, 50, 100] as const;

export const defaultRecipePageLimit = recipePageLimits[0];

export const isRecipePageLimit = (
  value: number,
): value is (typeof recipePageLimits)[number] =>
  recipePageLimits.includes(value as (typeof recipePageLimits)[number]);

export const getRecipePageLimit = (value: unknown) => {
  const parsed = Number(value);
  return isRecipePageLimit(parsed) ? parsed : defaultRecipePageLimit;
};
