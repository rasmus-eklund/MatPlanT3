import { type ReactNode } from "react";
import type { IngredientGroup } from "~/types";

type Props = {
  item: IngredientGroup["ingredients"][number];
  edit: ReactNode;
  remove: ReactNode;
};
const Item = ({ item, edit, remove }: Props) => {
  return (
    <div className="flex w-full items-center justify-between">
      <span>{item.name}</span>
      <div className="flex items-center gap-1">
        <span>{item.quantity}</span>
        <span>{item.unit}</span>
        {edit}
        {remove}
      </div>
    </div>
  );
};

export default Item;
