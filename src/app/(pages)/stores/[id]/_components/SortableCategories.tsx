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
import { groupSubcategoryByCategory } from "~/app/helpers/sortAndGroup";
import capitalize from "~/app/helpers/capitalize";
import type { RouterOutputs } from "~/trpc/shared";
import Icon from "~/icons/Icon";
import toast from "react-hot-toast";
import SortableItem from "./dnd/SortableItem";
import { useForm } from "react-hook-form";

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
              {({ attributes, listeners, isDragging }) => {
                return (
                  <Category
                    item={item}
                    setItems={setItems}
                    parentDragging={isDragging}
                    categories={items}
                  >
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
  parentDragging: boolean;
  categories: CategoryItem[];
};
const Category = ({
  children,
  item: { id: categoryId, name, subcategories },
  setItems,
  parentDragging,
  categories,
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
        const catIndex = items.findIndex((item) => item.id === categoryId)!;
        const category = { ...items[catIndex]! };
        const newSubcategories = arrayMove(
          category.subcategories,
          category.subcategories.findIndex((item) => item.id === active.id),
          category.subcategories.findIndex((item) => item.id === over.id),
        );
        category.subcategories = newSubcategories;
        const newItems = items.map((i) => (i.id === categoryId ? category : i));
        return newItems;
      });
    }
  };
  const moveSingleItem = ({
    from,
    to,
  }: {
    from: {
      categoryId: string;
      subcategoryId: string;
      subcategoryName: string;
    };
    to: string;
  }) => {
    setItems((items) =>
      items.map((cat) => {
        if (cat.id === from.categoryId) {
          return {
            ...cat,
            subcategories: subcategories.filter(
              (sub) => sub.id !== from.subcategoryId,
            ),
          };
        }
        if (cat.id === to) {
          return {
            ...cat,
            subcategories: [
              {
                id: from.subcategoryId,
                name: from.subcategoryName,
              },
              ...cat.subcategories,
            ],
          };
        }
        return cat;
      }),
    );
  };

  useEffect(() => {
    if (parentDragging) {
      setOpen(false);
    }
  }, [parentDragging]);
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
                      <li className="flex items-center justify-between rounded-md bg-c3 px-2 py-1 font-semibold">
                        <div className="flex items-center gap-2">
                          <button {...attributes} {...listeners}>
                            <Icon
                              className="h-5 w-5 fill-c4 md:hover:scale-110 md:hover:fill-c2"
                              icon="draggable"
                            />
                          </button>
                          <p className="select-none text-c5">
                            {capitalize(name)}
                          </p>
                        </div>
                        <MoveItemMenu
                          categories={categories}
                          onMove={(to) =>
                            moveSingleItem({
                              from: {
                                categoryId,
                                subcategoryId: id,
                                subcategoryName: name,
                              },
                              to,
                            })
                          }
                        />
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

type MoveProps = { categories: CategoryItem[]; onMove: (id: string) => void };
const MoveItemMenu = ({ categories, onMove }: MoveProps) => {
  const [move, setMove] = useState(false);
  const { register, handleSubmit } = useForm<{ to: string }>();
  return (
    <div className="relative">
      <Icon
        className="h-5 w-5 fill-c4 md:hover:scale-110 md:hover:fill-c2"
        icon="verticalDots"
        onClick={() => setMove((p) => !p)}
      />
      {move && (
        <form
          onSubmit={handleSubmit(({ to }) => onMove(to))}
          className="absolute right-full top-full border border-c5 bg-c2"
        >
          <p>Flytta till</p>
          <select {...register("to")}>
            {categories.map(({ name, id }) => (
              <option value={id} key={crypto.randomUUID()}>
                {name}
              </option>
            ))}
          </select>
          <Button callToAction>Flytta</Button>
        </form>
      )}
    </div>
  );
};

export default SortableCategories;
