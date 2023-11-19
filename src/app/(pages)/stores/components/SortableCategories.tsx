"use client";
import {
  type DragEndEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DndContext,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import type { CategoryItem } from "types";
import Button from "~/app/_components/Button";
import { api } from "~/trpc/react";
import type { tStoreOrder } from "~/zod/zodSchemas";
import { groupSubcategoryByCategory } from "~/app/helpers/groupSubcategoryByCategory";
import capitalize from "~/app/helpers/capitalize";
import type { RouterOutputs } from "~/trpc/shared";
import Icon from "~/icons/Icon";
import toast from "react-hot-toast";
import SortableItem from "./dnd/SortableItem";

type Store = RouterOutputs["store"]["getById"];
type Props = { store: Store };
const SortableCategories = ({ store: { order, id: storeId } }: Props) => {
  const initialOrder = order.map(({ subcategory: { id } }) => id).join("");
  const utils = api.useUtils();
  const [edited, setEdited] = useState(false);
  const [items, setItems] = useState(groupSubcategoryByCategory(order));
  const { mutate: updateStore, isLoading: updatingStore } =
    api.store.updateOrder.useMutation({
      onSuccess: () => {
        utils.store.getById.invalidate();
        setEdited(false);
      },
      onError: () => {
        toast.error("Något gick fel...");
      },
    });

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((items) => {
        const activeIndex = items.findIndex((item) => item.id === active.id);
        const overIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, activeIndex, overIndex);
      });
    }
  };

  const handleSaveOrder = () => {
    const data: tStoreOrder = items.flatMap((i) =>
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
  useEffect(() => {
    const newOrder = items
      .flatMap(({ subcategories }) => subcategories.map(({ id }) => id))
      .join("");
    if (newOrder !== initialOrder) {
      setEdited(true);
    }
  }, [items]);
  return (
    <ul className="flex flex-col gap-2 rounded-md bg-c3">
      <DndContext
        id="first-layer-dnd"
        onDragEnd={onDragEnd}
        sensors={sensors}
        modifiers={modifiers}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <SortableItem key={item.id} id={item.id}>
              {({ attributes, listeners }) => {
                return (
                  <Category item={item} setItems={setItems}>
                    <button {...attributes} {...listeners}>
                      <Icon
                        className="h-6 w-6 fill-c2 md:hover:scale-110 md:hover:fill-c5"
                        icon="draggable"
                      />
                    </button>
                  </Category>
                );
              }}
            </SortableItem>
          ))}
        </SortableContext>
      </DndContext>
      {edited && (
        <div className="absolute bottom-8 left-0 flex w-full items-center justify-end gap-4 px-10">
          <Button disabled={updatingStore} onClick={handleSaveOrder}>
            Spara
          </Button>
          <Button
            onClick={() => {
              setEdited(false);
              setItems(groupSubcategoryByCategory(order));
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
  children: ReactNode;
  item: CategoryItem;
  setItems: Dispatch<SetStateAction<CategoryItem[]>>;
};
const Category = ({
  children,
  item: { id, name, subcategories },
  setItems,
}: CategoryProps) => {
  const [open, setOpen] = useState(false);
  const touchSensor = useSensor(TouchSensor);
  const mouseSensor = useSensor(MouseSensor);
  const sensors = useSensors(mouseSensor, touchSensor);
  const modifiers = [restrictToParentElement, restrictToVerticalAxis];
  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((items) => {
        const catIndex = items.findIndex(item => item.id === id)!;
        const category = { ...items[catIndex]! };
        const newSubcategories = arrayMove(
          category.subcategories,
          category.subcategories.findIndex((item) => item.id === active.id),
          category.subcategories.findIndex((item) => item.id === over.id),
        );
        category.subcategories = newSubcategories;
        const newItems = items.map((i) => (i.id === id ? category : i));
        return newItems;
      });
    }
  };
  return (
    <li className="flex flex-col gap-2 rounded-md bg-c4 px-2 py-1">
      <div className="flex items-center justify-between gap-2">
        {children}
        <h3 className="grow select-none text-xl font-bold text-c2">
          {capitalize(name)}
        </h3>
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
            onDragEnd={onDragEnd}
            sensors={sensors}
            modifiers={modifiers}
          >
            <SortableContext
              items={subcategories}
              strategy={verticalListSortingStrategy}
            >
              {subcategories.map(({ id, name }) => (
                <SortableItem key={name} id={id}>
                  {({ attributes, listeners }) => {
                    return (
                      <li className="flex items-center gap-2 rounded-md bg-c3 px-2 py-1 font-semibold">
                        <button {...attributes} {...listeners}>
                          <Icon
                            className="h-5 w-5 fill-c4 md:hover:scale-110 md:hover:fill-c2"
                            icon="draggable"
                          />
                        </button>
                        <p className="select-none text-c5">
                          {capitalize(name)}
                        </p>
                      </li>
                    );
                  }}
                </SortableItem>
              ))}
            </SortableContext>
          </DndContext>
        </ul>
      )}
    </li>
  );
};

export default SortableCategories;
