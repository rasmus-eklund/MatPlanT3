"use client";
import {
  type DragEndEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DndContext,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useEffect, useState } from "react";
import type { CategoryItem } from "types";
import Button from "~/app/_components/Button";
import { api } from "~/trpc/react";
import type { tStoreOrder } from "~/zod/zodSchemas";
import { groupSubcategoryByCategory } from "~/app/helpers/groupSubcategoryByCategory";
import capitalize from "~/app/helpers/capitalize";
import { CSS } from "@dnd-kit/utilities";
import type { RouterOutputs } from "~/trpc/shared";
import Icon from "~/app/assets/icons/Icon";

type Store = RouterOutputs["store"]["getById"];

type Props = { store: Store };

const SortableCategories = ({ store: { order, id: storeId } }: Props) => {
  const { mutate: updateStore } = api.store.updateOrder.useMutation({
    onSuccess: (data) => {
      setCategoryItems(groupSubcategoryByCategory(data.order));
      setOrderEdited(false);
    },
    onError: (error) => {
      error.data?.zodError?.fieldErrors;
    },
  });
  const [categoryItems, setCategoryItems] = useState(
    groupSubcategoryByCategory(order),
  );
  const [orderEdited, setOrderEdited] = useState(false);
  const touchSensor = useSensor(TouchSensor);
  const mouseSensor = useSensor(MouseSensor);
  const sensors = useSensors(mouseSensor, touchSensor);

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setCategoryItems((items) => {
        setOrderEdited(true);
        return arrayMove(
          items,
          items.findIndex((item) => item.id === active.id),
          items.findIndex((item) => item.id === over.id),
        );
      });
    }
  };
  const subOrderChanged = (
    { activeId, overId }: { activeId: number; overId: number },
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
        categoryId: i.id,
        subcategoryId: s.id,
      })),
    );
    updateStore({ storeId, data });
  };

  return (
    <ul className="flex flex-col gap-2 rounded-md bg-c3">
      <DndContext
        id="first-layer-dnd"
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
        sensors={sensors}
      >
        <SortableContext
          items={categoryItems}
          strategy={verticalListSortingStrategy}
        >
          {categoryItems.map((item) => (
            <Category
              key={item.id}
              category={item}
              subOrderChanged={(data) => subOrderChanged(data, item)}
            />
          ))}
        </SortableContext>
      </DndContext>
      {orderEdited && (
        <div className="absolute bottom-8 left-0 flex w-full items-center justify-end gap-4 px-10">
          <Button onClick={handleSaveOrder}>Spara</Button>
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

type CategoryProps = {
  category: CategoryItem;
  subOrderChanged: ({
    overId,
    activeId,
  }: {
    overId: number;
    activeId: number;
  }) => void;
};

const Category = ({
  category: { id, name, subcategories },
  subOrderChanged,
}: CategoryProps) => {
  const [open, setOpen] = useState(false);
  const {
    isDragging,
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    setActivatorNodeRef,
  } = useSortable({ id });

  useEffect(() => {
    setOpen(false);
  }, [isDragging]);

  const touchSensor = useSensor(TouchSensor);
  const mouseSensor = useSensor(MouseSensor);
  const sensors = useSensors(mouseSensor, touchSensor);
  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      subOrderChanged({ overId: Number(over.id), activeId: Number(active.id) });
    }
  };
  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex flex-col gap-2 rounded-md bg-c4 px-2 py-1"
    >
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <div ref={setActivatorNodeRef} {...attributes} {...listeners}>
            <Icon
              className="h-6 w-6 fill-c2 md:hover:scale-110 md:hover:fill-c5"
              icon="draggable"
            />
          </div>
          <h3 className="select-none text-xl font-bold text-c2">
            {capitalize(name)}
          </h3>
        </div>
        <button onClick={() => setOpen(!open)}>
          <Icon
            className={"h-6 w-6 fill-c5 md:hover:scale-110 md:hover:fill-c2"}
            icon={open ? "up" : "down"}
          />
        </button>
      </div>
      {open && (
        <ul className="flex flex-col gap-1">
          <DndContext
            id="second-layer-dnd"
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
            sensors={sensors}
          >
            <SortableContext
              items={subcategories}
              strategy={verticalListSortingStrategy}
            >
              {subcategories.map((subcat) => (
                <Subcategory subcat={subcat} key={subcat.id} />
              ))}
            </SortableContext>
          </DndContext>
        </ul>
      )}
    </li>
  );
};

type SubcategoryProps = { subcat: { name: string; id: number } };
const Subcategory = ({ subcat: { id, name } }: SubcategoryProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    setActivatorNodeRef,
  } = useSortable({ id });
  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };
  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 rounded-md bg-c3 px-2 py-1 font-semibold"
    >
      <div ref={setActivatorNodeRef} {...attributes} {...listeners}>
        <Icon className="h-5 w-5 fill-c4 md:hover:fill-c2 md:hover:scale-110" icon="draggable" />
      </div>
      <p className="select-none text-c5">{capitalize(name)}</p>
    </li>
  );
};

export default SortableCategories;
