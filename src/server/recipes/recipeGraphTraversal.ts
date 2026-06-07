import { errorMessages } from "~/server/errors";

export type RecipeGraphDirection = "children" | "parents";

type RecipeGraphReader<Context> = ({
  context,
  direction,
  recipeId,
}: {
  context: Context;
  direction: RecipeGraphDirection;
  recipeId: string;
}) => Promise<string[]>;

export const createRecipeGraphTraversal = <Context>(
  getLinkedRecipeIds: RecipeGraphReader<Context>,
) => {
  const getLinkedRecipeDescendants = async ({
    context,
    direction,
    recipeId,
  }: {
    context: Context;
    direction: RecipeGraphDirection;
    recipeId: string;
  }): Promise<string[]> => {
    const processed = new Set<string>();
    const descendants = new Set<string>();

    const collect = async (id: string, path: Set<string>) => {
      if (path.has(id)) {
        throw new Error(errorMessages.CIRCULARREF);
      }
      if (processed.has(id)) {
        return;
      }

      const linkedRecipeIds = await getLinkedRecipeIds({
        context,
        direction,
        recipeId: id,
      });
      const linkedPath = new Set(path);
      linkedPath.add(id);

      for (const linkedRecipeId of linkedRecipeIds) {
        descendants.add(linkedRecipeId);
        await collect(linkedRecipeId, linkedPath);
      }

      processed.add(id);
    };

    await collect(recipeId, new Set());
    return [...descendants];
  };

  const recipeContainsRecipe = async ({
    context,
    sourceId,
    targetId,
  }: {
    context: Context;
    sourceId: string;
    targetId: string;
  }): Promise<boolean> => {
    if (sourceId === targetId) {
      return true;
    }

    const descendants = await getLinkedRecipeDescendants({
      context,
      direction: "children",
      recipeId: sourceId,
    });
    return descendants.includes(targetId);
  };

  return { getLinkedRecipeDescendants, recipeContainsRecipe };
};
