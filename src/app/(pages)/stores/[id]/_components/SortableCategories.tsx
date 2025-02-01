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
import { useState } from "react";
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
import { updateStoreOrder } from "~/server/api/stores";
import { toast } from "sonner";

type Props = {
  store_categories: StoreWithItems["store_categories"];
  storeId: string;
};
const SortableCategories = ({ store_categories, storeId }: Props) => {
  const [open, setOpen] = useState<string | null>(null);
  const [items, setItems] = useState(store_categories);

  const touchSensor = useSensor(TouchSensor);
  const mouseSensor = useSensor(MouseSensor);
  const sensors = useSensors(mouseSensor, touchSensor);
  const modifiers = [restrictToParentElement, restrictToVerticalAxis];

  const debounced = useDebounceCallback(async () => {
    const changes = getChanges({
      originalItems: store_categories,
      updatedItems: items,
    });
    if (changes) {
      await updateStoreOrder({ ...changes, storeId });
      toast.success("Sparat!");
    }
  }, 1000);

  return (
    <ul className="bg-c3 flex flex-col gap-2 rounded-md">
      <DndContext
        id="first-layer-dnd"
        onDragEnd={async (e) => {
          categoryOnDragEnd(e, setItems);
          try {
            await debounced();
          } catch {
            setItems(store_categories);
          }
        }}
        sensors={sensors}
        modifiers={modifiers}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          {items.map((category) => (
            <SortableItem key={category.id} id={category.id}>
              {({ attributes, listeners }) => {
                return (
                  <li className="bg-c4 flex flex-col gap-2 rounded-md px-2 py-1">
                    <div className="flex items-center justify-between gap-2">
                      <button {...attributes} {...listeners}>
                        <Icon
                          className="fill-c2 md:hover:fill-c5 size-6 md:hover:scale-110"
                          icon="draggable"
                        />
                      </button>
                      <h3 className="text-c2 grow text-xl font-bold select-none">
                        {capitalize(category.category.name)}
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
                            "fill-c5 md:hover:fill-c2 size-6 md:hover:scale-110"
                          }
                          icon={open === category.id ? "up" : "down"}
                        />
                      </button>
                    </div>
                    {category.id === open && (
                      <ul className="flex flex-col gap-1">
                        <DndContext
                          id="second-layer-dnd"
                          onDragEnd={async (e) => {
                            subcategoryOnDragEnd(e, setItems, category.id);
                            try {
                              await debounced();
                            } catch {
                              setItems(store_categories);
                            }
                          }}
                          sensors={sensors}
                          modifiers={modifiers}
                        >
                          <SortableContext
                            items={category.store_subcategories}
                            strategy={verticalListSortingStrategy}
                          >
                            {category.store_subcategories.map((subcategory) => (
                              <SortableItem
                                key={subcategory.subcategory.id}
                                id={subcategory.id}
                              >
                                {({ attributes, listeners }) => {
                                  return (
                                    <li className="bg-c3 flex items-center justify-between rounded-md px-2 py-1 font-semibold">
                                      <div className="flex items-center gap-2">
                                        <button {...attributes} {...listeners}>
                                          <Icon
                                            className="fill-c4 md:hover:fill-c2 size-5 md:hover:scale-110"
                                            icon="draggable"
                                          />
                                        </button>
                                        <p className="text-c5 select-none">
                                          {capitalize(
                                            subcategory.subcategory.name,
                                          )}
                                        </p>
                                      </div>
                                      <MoveItemDialog
                                        selectedSubcategory={
                                          subcategory.subcategory.name
                                        }
                                        currentCategory={category.category.name}
                                        categories={items.filter(
                                          (i) => i.id !== category.id,
                                        )}
                                        onMove={async (newCategoryId) => {
                                          moveSubcategoryItem({
                                            item: subcategory,
                                            from: { categoryId: category.id },
                                            to: { categoryId: newCategoryId },
                                            setItems,
                                          });
                                          try {
                                            await debounced();
                                          } catch {
                                            setItems(store_categories);
                                          }
                                        }}
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
