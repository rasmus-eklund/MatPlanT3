import { type Dispatch, type SetStateAction } from "react";
import Icon from "~/components/common/Icon";
import { crudFactory } from "~/lib/utils";
import { searchRecipeName } from "~/server/api/recipes";
import type { Recipe } from "~/server/shared";
import { unitsAbbr } from "~/lib/constants/units";
import SearchModal from "~/components/common/SearchModal";

type FormProps = {
  recipes: Recipe["contained"];
  setRecipes: Dispatch<SetStateAction<Recipe["contained"]>>;
  parentId: string;
};

const RecipeInsideRecipeForm = ({ recipes, setRecipes, parentId }: FormProps) => {
  const { add, update, remove } = crudFactory(setRecipes);

  return (
    <div className="relative flex flex-col gap-2 rounded-md bg-c3 p-4">
      <SearchModal
        title="recept"
        onSearch={searchRecipeName}
        excludeId={parentId}
        onSubmit={async (r) =>
          add({
            name: r.name,
            id: crypto.randomUUID(),
            unit: r.unit,
            quantity: r.quantity,
            recipeId: r.id,
            containerId: parentId,
          })
        }
      />
      {!!recipes.length && (
        <ul className="flex flex-col gap-1 rounded-md bg-c4 p-1">
          {recipes.map(({ id, name, quantity, unit, recipeId, containerId }) => (
            <li key={id} className="relative flex flex-col rounded-md bg-c2 p-1 text-c5">
              <div className="flex justify-between">
                <p>{name}</p>
                <Icon icon="Trash" onClick={() => remove({ id })} />
              </div>
              <div className="flex gap-2">
                <p>
                  {quantity} {unitsAbbr[unit]}
                </p>
                <SearchModal
                  title="recept"
                  item={{ name, id, unit, quantity }}
                  excludeId={parentId}
                  onSearch={searchRecipeName}
                  onSubmit={async (r) =>
                    update({
                      containerId,
                      recipeId,
                      id,
                      name: r.name,
                      quantity: r.quantity,
                      unit: r.unit,
                    })
                  }
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecipeInsideRecipeForm;
