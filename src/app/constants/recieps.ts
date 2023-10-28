import { Recipe } from "@/types";

const createDefaultRecipes = (): Recipe[] => {
  const test1 = crypto.randomUUID();
  const test2 = crypto.randomUUID();
  const test3 = crypto.randomUUID();
  const t3: Recipe = {
    id: test3,
    name: "Test3",
    portions: 2,
    instruction: "Test 3",
    ingredients: [
      {
        name: "apelsin",
        quantity: 1,
        unit: "st",
        id: crypto.randomUUID(),
        recipeId: test3,
      },
    ],
    children: [],
  };
  const t2: Recipe = {
    id: test2,
    name: "Test2",
    portions: 2,
    instruction: "Test 2",
    ingredients: [
      {
        name: "gurka",
        quantity: 1,
        unit: "st",
        id: crypto.randomUUID(),
        recipeId: test2,
      },
    ],
    children: [{ id: t3.id, name: t3.name, portions: t3.portions }],
  };
  const t1: Recipe = {
    id: test1,
    name: "Test1",
    portions: 2,
    instruction: "Test 1",
    ingredients: [
      {
        name: "banan",
        quantity: 1,
        unit: "st",
        id: crypto.randomUUID(),
        recipeId: test1,
      },
    ],
    children: [{ id: t2.id, name: t2.name, portions: t2.portions }],
  };
  return [t3, t2, t1];
};

export default createDefaultRecipes;
