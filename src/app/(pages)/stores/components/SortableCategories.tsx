"use client";
import {
  type DragEndEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DndContext,
  DraggableAttributes,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import { ReactNode, useState } from "react";
import type { CategoryItem } from "types";
import Button from "~/app/_components/Button";
import { api } from "~/trpc/react";
import type { tStoreOrder } from "~/zod/zodSchemas";
import { groupSubcategoryByCategory } from "~/app/helpers/groupSubcategoryByCategory";
import capitalize from "~/app/helpers/capitalize";
import { CSS } from "@dnd-kit/utilities";
import type { RouterOutputs } from "~/trpc/shared";
import Icon from "~/icons/Icon";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import toast from "react-hot-toast";

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

type Store = RouterOutputs["store"]["getById"];
type Props = { store: Store };
const SortableCategories = ({ store: { order, id: storeId } }: Props) => {
  const [open, setOpen] = useState(false);
  const utils = api.useUtils();
  const [orderEdited, setOrderEdited] = useState(false);
  const [categoryItems, setCategoryItems] = useState(
    groupSubcategoryByCategory(order),
  );
  const { mutate: updateStore, isLoading: updatingStore } =
    api.store.updateOrder.useMutation({
      onSuccess: () => {
        utils.store.getById.invalidate();
        setOrderEdited(false);
      },
      onError: () => {
        toast.error("Något gick fel...");
      },
    });

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setCategoryItems((items) => {
        const activeIndex = items.findIndex((item) => item.id === active.id);
        const overIndex = items.findIndex((item) => item.id === over.id);
        setOrderEdited(true);
        return arrayMove(items, activeIndex, overIndex);
      });
    }
  };

  const subOrderChanged = (
    { activeId, overId }: { activeId: string; overId: string },
    { id, subcategories }: CategoryItem,
  ) => {
    setCategoryItems((items) => {
      const subArrayIndex = items.findIndex((item) => item.id === id);
      const newSubcategories = arrayMove(
        subcategories,
        subcategories.findIndex((item) => item.id === activeId),
        subcategories.findIndex((item) => item.id === overId),
      );
      const newItems = [...items];
      newItems[subArrayIndex]!.subcategories = newSubcategories;
      setOrderEdited(true);
      return newItems;
    });
  };

  const handleSaveOrder = () => {
    const data: tStoreOrder = categoryItems.flatMap((i) =>
      i.subcategories.map((s) => ({
        categoryId: Number(i.id),
        subcategoryId: Number(s.id),
      })),
    );
    updateStore({ storeId, data });
  };
  const touchSensor = useSensor(TouchSensor);
  const mouseSensor = useSensor(MouseSensor);
  const sensors = useSensors(mouseSensor, touchSensor);
  const modifiers = [restrictToParentElement, restrictToVerticalAxis];
  return (
    <ul className="flex flex-col gap-2 rounded-md bg-c3">
      <DndContext
        id="first-layer-dnd"
        onDragEnd={onDragEnd}
        sensors={sensors}
        modifiers={modifiers}
      >
        <SortableContext
          items={categoryItems}
          strategy={verticalListSortingStrategy}
        >
          {categoryItems.map((item) => (
            <SortableItem key={item.id} id={item.id}>
              {({ attributes, listeners }) => (
                <li className="flex flex-col gap-2 rounded-md bg-c4 px-2 py-1">
                  <div className="flex items-center justify-between gap-2">
                    <button {...attributes} {...listeners}>
                      <Icon
                        className="h-6 w-6 fill-c2 md:hover:scale-110 md:hover:fill-c5"
                        icon="draggable"
                      />
                    </button>
                    <h3 className="grow select-none text-xl font-bold text-c2">
                      {capitalize(item.name)}
                    </h3>
                    <button onClick={() => setOpen(!open)}>
                      <Icon
                        className={
                          "h-6 w-6 fill-c5 md:hover:scale-110 md:hover:fill-c2"
                        }
                        icon={open ? "up" : "down"}
                      />
                    </button>
                  </div>
                  {open && (
                    <ul className="flex flex-col gap-1">
                      <Subcategories
                        subcategories={item.subcategories}
                        subOrderChanged={(data) => subOrderChanged(data, item)}
                      />
                    </ul>
                  )}
                </li>
              )}
            </SortableItem>
          ))}
        </SortableContext>
      </DndContext>
      {orderEdited && (
        <div className="absolute bottom-8 left-0 flex w-full items-center justify-end gap-4 px-10">
          <Button disabled={updatingStore} onClick={handleSaveOrder}>
            Spara
          </Button>
          <Button
            onClick={() => {
              setOrderEdited(false);
              setCategoryItems(groupSubcategoryByCategory(order));
            }}
          >
            Avbryt
          </Button>
        </div>
      )}
    </ul>
  );
};

type SubcategoriesProps = {
  subcategories: CategoryItem["subcategories"];
  subOrderChanged: ({
    overId,
    activeId,
  }: {
    overId: string;
    activeId: string;
  }) => void;
};

const Subcategories = ({
  subcategories,
  subOrderChanged,
}: SubcategoriesProps) => {
  const touchSensor = useSensor(TouchSensor);
  const mouseSensor = useSensor(MouseSensor);
  const sensors = useSensors(mouseSensor, touchSensor);
  const modifiers = [restrictToParentElement, restrictToVerticalAxis];
  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      subOrderChanged({
        overId: over.id.toString(),
        activeId: active.id.toString(),
      });
    }
  };
  return (
    <DndContext
      id="second-layer-dnd"
      onDragEnd={onDragEnd}
      sensors={sensors}
      modifiers={modifiers}
    >
      <SortableContext
        items={subcategories}
        strategy={verticalListSortingStrategy}
      >
        {subcategories.map(({ id, name }) => (
          <SortableItem key={id} id={id}>
            {({ attributes, listeners }) => (
              <li className="flex items-center gap-2 rounded-md bg-c3 px-2 py-1 font-semibold">
                <button {...attributes} {...listeners}>
                  <Icon
                    className="h-5 w-5 fill-c4 md:hover:scale-110 md:hover:fill-c2"
                    icon="draggable"
                  />
                </button>
                <p className="select-none text-c5">{capitalize(name)}</p>
              </li>
            )}
          </SortableItem>
        ))}
      </SortableContext>
    </DndContext>
  );
};

export default SortableCategories;
