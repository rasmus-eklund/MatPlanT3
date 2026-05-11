"use client";
import { useState } from "react";
import Icon from "~/components/common/Icon";
import { Spinner } from "~/components/ui/spinner";
import { type User } from "~/server/auth";
import type { Item } from "~/server/shared";
import { useShoppingItemsStore } from "~/stores/shopping-items-store";

type Props = { items: Item[]; user: User };

const DeleteCheckedItems = ({ items, user }: Props) => {
  const [loading, setLoading] = useState(false);
  const removeCheckedItems = useShoppingItemsStore(
    (state) => state.removeCheckedItems,
  );
  const removable = items
    .filter((item) => item.checked && !item.menuId)
    .map((item) => ({ id: item.id, name: item.ingredient.name }));
  const handleRemove = async () => {
    setLoading(true);
    await removeCheckedItems(removable, user);
    setLoading(false);
  };
  if (removable.length === 0) return null;
  if (loading) return <Spinner className="size-5" />;
  return (
    <div onClick={handleRemove} className="relative">
      <p className="absolute bottom-1.5 -left-1.5 text-xs">
        {removable.length}
      </p>
      <Icon icon="Trash" />
    </div>
  );
};

export default DeleteCheckedItems;
