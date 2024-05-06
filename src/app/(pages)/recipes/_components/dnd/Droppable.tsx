import type { Dispatch, SetStateAction } from "react";
import { useDroppable } from "@dnd-kit/core";
import { rectSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import SortableItem from "~/app/(pages)/stores/[id]/_components/SortableItem";
import Item from "./Item";
import Icon from "~/icons/Icon";
import type { IngredientGroup } from "~/types";
import EditItem from "~/components/common/EditItem";
import { updateItem } from "./helpers";

type Props = {
  item: IngredientGroup;
  setItems: Dispatch<SetStateAction<IngredientGroup[]>>;
};
const Droppable = ({ item: { id, ingredients: items }, setItems }: Props) => {
  const { setNodeRef } = useDroppable({ id });

  return (
    <SortableContext id={id} items={items} strategy={rectSortingStrategy}>
      <ul className="min-h-10 space-y-1 border p-1" ref={setNodeRef}>
        {items.map((item) => (
          <SortableItem key={item.id} id={item.id}>
            {({ attributes, listeners, isDragging }) => (
              <li
                className={`flex w-full items-center justify-between gap-2 rounded-md bg-c2 p-1 ${isDragging ? "opacity-50" : "opacity-100"}`}
              >
                <Icon
                  className="cursor-grab"
                  {...attributes}
                  {...listeners}
                  icon="draggable"
                />
                <Item
                  item={item}
                  edit={
                    <EditItem
                      item={item}
                      onUpdate={async (data) => {
                        setItems((items) => updateItem(id, items, data));
                      }}
                    />
                  }
                  remove={<Icon icon="delete" />}
                />
              </li>
            )}
          </SortableItem>
        ))}
      </ul>
    </SortableContext>
  );
};

export default Droppable;
