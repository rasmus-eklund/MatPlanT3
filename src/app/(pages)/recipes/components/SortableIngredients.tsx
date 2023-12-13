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
import { Dispatch, SetStateAction } from "react";
import { RouterOutputs } from "~/trpc/shared";
import EditIngredient from "~/app/_components/EditIngredient";
import Icon from "~/icons/Icon";

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

type Ingredient = RouterOutputs["recipe"]["getById"]["ingredients"][number];
type Props = {
  items: Ingredient[];
  setItems: Dispatch<SetStateAction<Ingredient[]>>;
  crud: {
    update: (item: Ingredient) => void;
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
                  <EditIngredient
                    className="relative pl-8"
                    ingredient={item}
                    onEdit={(i) => update({ ...i, order, group: null })}
                    onRemove={() => remove({ id: item.id })}
                  >
                    <button
                      className="absolute left-1"
                      {...attributes}
                      {...listeners}
                    >
                      <Icon
                        icon="draggable"
                        className="h-6 cursor-grab fill-c4"
                      />
                    </button>
                  </EditIngredient>
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
