"use client";
import { toast } from "sonner";
import SearchItem from "~/components/common/SearchItem";
import type { MeilIngredient } from "~/types";

type Props = { addItem: (item: MeilIngredient) => Promise<void> };

const AddItem = ({ addItem }: Props) => {
  const onSubmit = async (ing: MeilIngredient) => {
    try {
      await addItem(ing);
      toast.success(`Lade till ${ing.name}`);
    } catch (error) {
      toast.error("Något gick fel");
    }
  };
  return <SearchItem onSubmit={onSubmit} />;
};

export default AddItem;
