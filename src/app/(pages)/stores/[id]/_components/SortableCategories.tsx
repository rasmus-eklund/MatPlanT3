"use client";
import {
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DndContext,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import { useEffect, useState } from "react";
import { useDebounceCallback } from "usehooks-ts";
import { capitalize } from "~/lib/utils";
import Icon from "~/icons/Icon";
import SortableItem from "./SortableItem";
import type { StoreWithItems } from "~/server/shared";
import MoveItemDialog from "./MoveItemDialog";
import {
  categoryOnDragEnd,
  getChanges,
  moveSubcategoryItem,
  subcategoryOnDragEnd,
} from "./utils";
import type { CategoryItem } from "~/types";
import { updateStoreOrder } from "~/server/api/stores";

type Props = {
  store_categories: StoreWithItems["categories"];
  storeId: string;
};
const SortableCategories = ({ store_categories, storeId }: Props) => {
  const [open, setOpen] = useState<string | null>(null);
  const [items, setItems] = useState<CategoryItem[]>(store_categories);

  const touchSensor = useSensor(TouchSensor);
  const mouseSensor = useSensor(MouseSensor);
  const sensors = useSensors(mouseSensor, touchSensor);
  const modifiers = [restrictToParentElement, restrictToVerticalAxis];

  const debounced = useDebounceCallback(updateStoreOrder, 2000);
  useEffect(() => {
    const changes = getChanges({
      originalItems: store_categories,
      updatedItems: items,
    });
    if (changes) {
      debounced({ ...changes, storeId })?.catch(() =>
        setItems(store_categories),
      );
    }
  }, [items, store_categories, debounced, storeId]);

  return (
    <ul className="flex flex-col gap-2 rounded-md bg-c3">
      <DndContext
        id="first-layer-dnd"
        onDragEnd={(e) => categoryOnDragEnd(e, setItems)}
        sensors={sensors}
        modifiers={modifiers}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          {items.map((category) => (
            <SortableItem key={category.id} id={category.id}>
              {({ attributes, listeners }) => {
                return (
                  <li className="flex flex-col gap-2 rounded-md bg-c4 px-2 py-1">
                    <div className="flex items-center justify-between gap-2">
                      <button {...attributes} {...listeners}>
                        <Icon
                          className="size-6 fill-c2 md:hover:scale-110 md:hover:fill-c5"
                          icon="draggable"
                        />
                      </button>
                      <h3 className="grow select-none text-xl font-bold text-c2">
                        {capitalize(category.name)}
                      </h3>
                      <button
                        onClick={() =>
                          setOpen((p) =>
                            p === category.id ? null : category.id,
                          )
                        }
                      >
                        <Icon
                          className={
                            "size-6 fill-c5 md:hover:scale-110 md:hover:fill-c2"
                          }
                          icon={open ? "up" : "down"}
                        />
                      </button>
                    </div>
                    {category.id === open && (
                      <ul className="flex flex-col gap-1">
                        <DndContext
                          id="second-layer-dnd"
                          onDragEnd={(e) =>
                            subcategoryOnDragEnd(e, setItems, category.id)
                          }
                          sensors={sensors}
                          modifiers={modifiers}
                        >
                          <SortableContext
                            items={category.subcategories}
                            strategy={verticalListSortingStrategy}
                          >
                            {category.subcategories.map((subcategory) => (
                              <SortableItem
                                key={subcategory.name}
                                id={subcategory.id}
                              >
                                {({ attributes, listeners }) => {
                                  return (
                                    <li className="flex items-center justify-between rounded-md bg-c3 px-2 py-1 font-semibold">
                                      <div className="flex items-center gap-2">
                                        <button {...attributes} {...listeners}>
                                          <Icon
                                            className="size-5 fill-c4 md:hover:scale-110 md:hover:fill-c2"
                                            icon="draggable"
                                          />
                                        </button>
                                        <p className="select-none text-c5">
                                          {capitalize(subcategory.name)}
                                        </p>
                                      </div>
                                      <MoveItemDialog
                                        selectedSubcategory={subcategory.name}
                                        currentCategory={category.name}
                                        categories={items.filter(
                                          (i) => i.id !== category.id,
                                        )}
                                        onMove={(id) =>
                                          moveSubcategoryItem({
                                            from: {
                                              categoryId: category.id,
                                              subcategoryId: subcategory.id,
                                              subcategoryName: subcategory.name,
                                            },
                                            to: { categoryId: id },
                                            setItems,
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
              }}
            </SortableItem>
          ))}
        </SortableContext>
      </DndContext>
    </ul>
  );
};

export default SortableCategories;
