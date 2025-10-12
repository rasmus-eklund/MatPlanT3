"use client";
import React from "react";
import Icon from "~/components/common/Icon";
import { removeCheckedItems } from "~/server/api/items";
import { type User } from "~/server/auth";
import type { Item } from "~/server/shared";

type Props = { items: Item[]; user: User };

const DeleteCheckedItems = ({ items, user }: Props) => {
  const removable = items
    .filter((item) => item.checked && !item.menuId)
    .map((item) => item.id);
  const handleRemove = async () =>
    await removeCheckedItems({
      ids: removable,
      user,
    });
  if (removable.length === 0) return null;
  return (
    <div onClick={handleRemove} className="relative">
      <p className="absolute bottom-1.5 -left-1.5 text-xs">{removable.length}</p>
      <Icon icon="Trash" />
    </div>
  );
};

export default DeleteCheckedItems;
