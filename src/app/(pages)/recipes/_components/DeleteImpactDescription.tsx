import type { getRecipeDeleteParents } from "~/server/api/recipes";

const recipeListFormatter = new Intl.ListFormat("sv", {
  style: "long",
  type: "conjunction",
});

const formatRecipeNames = (recipes: { name: string }[]) =>
  recipeListFormatter.formatToParts(recipes.map((recipe) => recipe.name)).map((part, index) =>
    part.type === "element" ? (
      <strong key={index} className="font-semibold text-foreground">
        {part.value}
      </strong>
    ) : (
      part.value
    ),
  );

export const DeleteImpactDescription = ({
  parents,
}: {
  parents: Awaited<ReturnType<typeof getRecipeDeleteParents>>;
}) => {
  return (
    <>
      <span className="block">Är du säker på att du vill ta bort receptet?</span>
      {!!parents.length && (
        <span className="mt-2 block">
          Receptet används i andra recept. Om du tar bort det kommer dessa recept inte längre
          innehålla receptet: {formatRecipeNames(parents)}.
        </span>
      )}
    </>
  );
};
