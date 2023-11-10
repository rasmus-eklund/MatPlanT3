"use client";
import capitalize from "~/app/helpers/capitalize";
import { RouterOutputs } from "~/trpc/shared";
import Button from "../Button";
import Icon from "../icons/Icon";
import { api } from "~/trpc/react";
import { useState } from "react";
type Ingredient = RouterOutputs["admin"]["getAll"][number];

type Props = {
  ing: Ingredient;
  selCat: Ingredient["category"];
  selSub: Ingredient["subcategory"];
};
const SelectedIngredient = ({ ing, selCat, selSub }: Props) => {
  const [name, setName] = useState(ing.name);
  const utils = api.useUtils();
  const { mutate: update, isLoading: updating } = api.admin.update.useMutation({
    onSuccess: () => {
      utils.admin.getAll.invalidate();
    },
  });
  const { mutate: remove, isLoading: deleting } = api.admin.remove.useMutation({
    onSuccess: () => {
      utils.admin.getAll.invalidate();
    },
  });
  const differentCat = ing.category.id !== selCat.id;
  const differentSub = ing.subcategory.id !== selSub.id;
  return (
    <section>
      <div className="flex flex-col gap-2 bg-c3">
        <form>
          <input
            type="text"
            value={name}
            onChange={({ target: { value } }) => setName(value)}
            className="text-xl"
          />
        </form>
        <div className="flex gap-2">
          <p>{capitalize(ing.category.name)}</p>
          {differentCat && <p>{` ---> ${selCat.name}`}</p>}
        </div>
        <div className="flex gap-2">
          <p>{capitalize(ing.subcategory.name)}</p>
          {differentSub && <p>{` ---> ${selSub.name}`}</p>}
        </div>
        <button disabled={deleting} onClick={() => remove({ id: ing.id })}>
          <Icon icon="delete" className="w-10 fill-c5" />
        </button>
        {(differentCat || differentSub) && (
          <Button
            disabled={updating}
            onClick={() =>
              update({
                id: ing.id,
                ing: {
                  categoryId: selCat.id,
                  subcategoryId: selSub.id,
                  name: ing.name,
                },
              })
            }
          >
            Spara ändring
          </Button>
        )}
      </div>
    </section>
  );
};

export default SelectedIngredient;
