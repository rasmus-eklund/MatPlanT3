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
import { capitalize } from "~/lib/utils";
import Icon from "~/icons/Icon";
import SortableItem from "./SortableItem";
import MoveItemDialog from "./MoveItemDialog";
import { ClipLoader } from "react-spinners";
import { Button } from "~/components/ui/button";
import { type StoreWithItems } from "~/server/shared";
import { useState } from "react";
import {
  getChanges,
  hasChanges,
  moveSubcategoryItem,
  updateCategoryOrder,
  updateSubcategoryOrder,
} from "./utils";
import { updateStoreOrder } from "~/server/api/stores";

type Props = {
  categories: StoreWithItems["store_categories"];
  storeId: string;
};
const SortableCategories = ({
  categories: originalCategories,
  storeId,
}: Props) => {
  const [open, setOpen] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState(originalCategories);

  const touchSensor = useSensor(TouchSensor);
  const mouseSensor = useSensor(MouseSensor);
  const sensors = useSensors(mouseSensor, touchSensor);
  const modifiers = [restrictToParentElement, restrictToVerticalAxis];

  const isChanged = hasChanges(categories, originalCategories);

  const saveStoreOrder = async () => {
    setLoading(true);
    const changes = getChanges({
      originalItems: originalCategories,
      updatedItems: categories,
    });
    await updateStoreOrder({ ...changes, storeId });
    setLoading(false);
  };

  const openIcon = () => {
    return open === null ? "down" : "up";
  };

  return (
    <>
      <div className="fixed inset-x-0 bottom-8 mx-auto flex w-full max-w-5xl justify-end gap-2 px-3">
        {loading && <ClipLoader />}
        {isChanged && !loading && (
          <>
            <Button onClick={() => setCategories(originalCategories)}>
              Återställ
            </Button>
            <Button onClick={async () => saveStoreOrder()}>Spara</Button>
          </>
        )}
      </div>
      <ul className="bg-c3 flex flex-col gap-2 rounded-md pb-10">
        <DndContext
          id="first-layer-dnd"
          onDragEnd={(e) => {
            const newCategories = updateCategoryOrder(e, categories);
            if (newCategories) {
              setCategories(newCategories);
            }
          }}
          sensors={sensors}
          modifiers={modifiers}
        >
          <SortableContext
            items={categories}
            strategy={verticalListSortingStrategy}
          >
            {categories.map((category) => (
              <SortableItem key={category.id} id={category.id}>
                {({ attributes, listeners, isDragging }) => {
                  return (
                    <li className="bg-c4 flex flex-col gap-2 rounded-md px-2 py-1">
                      <div className="flex items-center justify-between gap-2">
                        <button
                          {...attributes}
                          {...listeners}
                          disabled={!!open}
                          className={`hover:cursor-grab disabled:hover:cursor-not-allowed ${isDragging ? "hover:cursor-grabbing" : ""}`}
                        >
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
                            setOpen(open === category.id ? null : category.id)
                          }
                        >
                          <Icon
                            className={
                              "fill-c5 md:hover:fill-c2 size-6 md:hover:scale-110"
                            }
                            icon={openIcon()}
                          />
                        </button>
                      </div>
                      {category.id === open && (
                        <ul className="flex flex-col gap-1">
                          <DndContext
                            id="second-layer-dnd"
                            onDragEnd={(e) => {
                              const newCategories = updateSubcategoryOrder(
                                e,
                                category.id,
                                categories,
                              );
                              if (newCategories) {
                                setCategories(newCategories);
                              }
                            }}
                            sensors={sensors}
                            modifiers={modifiers}
                          >
                            <SortableContext
                              items={category.store_subcategories}
                              strategy={verticalListSortingStrategy}
                            >
                              {category.store_subcategories.map(
                                (subcategory) => (
                                  <SortableItem
                                    key={subcategory.subcategory.id}
                                    id={subcategory.id}
                                  >
                                    {({ attributes, listeners }) => {
                                      return (
                                        <li className="bg-c3 flex items-center justify-between rounded-md px-2 py-1 font-semibold">
                                          <div className="flex items-center gap-2">
                                            <button
                                              {...attributes}
                                              {...listeners}
                                              className={`hover:cursor-grab disabled:hover:cursor-not-allowed ${isDragging ? "hover:cursor-grabbing" : ""}`}
                                            >
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
                                            currentCategory={
                                              category.category.name
                                            }
                                            categories={categories.filter(
                                              (i) => i.id !== category.id,
                                            )}
                                            onMove={async (newCategoryId) =>
                                              setCategories(
                                                moveSubcategoryItem({
                                                  item: subcategory,
                                                  from: {
                                                    categoryId: category.id,
                                                  },
                                                  to: {
                                                    categoryId: newCategoryId,
                                                  },
                                                  categories,
                                                }),
                                              )
                                            }
                                          />
                                        </li>
                                      );
                                    }}
                                  </SortableItem>
                                ),
                              )}
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
    </>
  );
};

export default SortableCategories;
