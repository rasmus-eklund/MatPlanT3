import React from "react";
import ServerFormSubmit from "~/components/common/ServerFormSubmit";
import { removeCheckedItems } from "~/server/api/items";
import type { Item } from "~/server/shared";

type Props = { items: Item[] };

const DeleteCheckedItems = ({ items }: Props) => {
  const removable = items
    .filter((item) => item.checked && !item.recipe_ingredient)
    .map((item) => item.id);
  if (removable.length !== 0)
    return (
      <form
        action={async () => {
          "use server";
          await removeCheckedItems(removable);
        }}
      >
        <ServerFormSubmit>Ta bort markerade</ServerFormSubmit>
      </form>
    );
};

export default DeleteCheckedItems;
