"use client";
import {
  DndContext,
  useSensor,
  type DragEndEvent,
  TouchSensor,
  MouseSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import type { Dispatch, SetStateAction } from "react";
import Icon from "~/icons/Icon";
import type { Recipe } from "~/server/shared";
import EditItem from "~/components/common/EditItem";
import { capitalize } from "~/lib/utils";

type Item = Recipe["ingredients"][number];

type UseSortableReturn = Omit<
  ReturnType<typeof useSortable>,
  "setNodeRef" | "transform" | "transition"
>;

type SortableItemProps = {
  id: string;
  children: (args: UseSortableReturn) => React.ReactNode;
};

const SortableItem = (props: SortableItemProps) => {
  const { setNodeRef, transform, transition, ...rest } = useSortable({
    id: props.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div ref={setNodeRef} style={style}>
      {props.children({ ...rest })}
    </div>
  );
};

type Props = {
  items: Item[];
  setItems: Dispatch<SetStateAction<Item[]>>;
  crud: {
    update: (item: Item) => void;
    remove: ({ id }: { id: string }) => void;
  };
};

const SortableIngredients = ({
  items,
  setItems,
  crud: { remove, update },
}: Props) => {
  const modifiers = [restrictToParentElement];
  const touchSensor = useSensor(TouchSensor);
  const mouseSensor = useSensor(MouseSensor);
  const sensors = useSensors(mouseSensor, touchSensor);
  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const activeIndex = items.map((i) => i.id).indexOf(active.id as string);
      const overIndex = items.map((i) => i.id).indexOf(over.id as string);
      if (activeIndex !== undefined && overIndex !== undefined) {
        const newOrder = arrayMove(items, activeIndex, overIndex);
        setItems(newOrder);
      }
    }
  };

  return (
    <div className="relative flex w-full flex-col gap-1">
      <DndContext modifiers={modifiers} onDragEnd={onDragEnd} sensors={sensors}>
        <SortableContext strategy={verticalListSortingStrategy} items={items}>
          {items.map((item) => {
            const { id, order } = item;
            return (
              <SortableItem key={id} id={id}>
                {({ attributes, listeners }) => (
                  <li className="flex w-full items-center justify-between rounded-md bg-c2 p-1">
                    <div className="flex items-center gap-2">
                      <button {...attributes} {...listeners}>
                        <Icon
                          icon="draggable"
                          className="h-6 cursor-grab fill-c4"
                        />
                      </button>
                      <span>{capitalize(item.name)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{item.quantity}</span>
                      <span>{item.unit}</span>
                      <EditItem
                        item={item}
                        onUpdate={async (data) =>
                          update({
                            ...data,
                            order,
                            groupId: item.groupId,
                            recipeId: item.recipeId,
                          })
                        }
                      />
                      <button onClick={() => remove({ id: item.id })}>
                        <Icon icon="delete" />
                      </button>
                    </div>
                  </li>
                )}
              </SortableItem>
            );
          })}
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default SortableIngredients;
