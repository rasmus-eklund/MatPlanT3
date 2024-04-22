export type MeilIngredient = {
  ingredientId: string;
  name: string;
  category: string;
  subcategory: string;
};

export type MeilRecipe = {
  id: string;
  name: string;
  ingredients: string[];
  userId: string;
  isPublic: boolean;
};

export type CategoryItem = {
  name: string;
  id: string;
  order: number;
  subcategories: { name: string; id: string; order: number }[];
};
