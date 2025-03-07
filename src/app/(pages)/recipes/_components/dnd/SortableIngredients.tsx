import { type Dispatch, type SetStateAction, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  handleDragEnd,
  handleDragOver,
  handleDragStart,
  insertIngredientToGroup,
  newIng,
  removeGroup,
  type SetActive,
} from "./helpers";
import Item from "./Item";
import Droppable from "./Droppable";
import Icon from "~/icons/Icon";
import SortableItem from "~/app/(pages)/stores/[id]/_components/SortableItem";
import type { IngredientGroup } from "~/types";
import { capitalize } from "~/lib/utils";
import SearchModal from "~/components/common/SearchModal";
import { searchItem } from "~/server/api/items";

type Props = {
  recipeId: string;
  groups: IngredientGroup[];
  setGroups: Dispatch<SetStateAction<IngredientGroup[]>>;
};
const SortableIngredients = ({ groups, setGroups, recipeId }: Props) => {
  const [activeItem, setActiveItem] = useState<SetActive>(null);

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const handleDragCancel = () => setActiveItem(null);

  return (
    <ul className="flex flex-col gap-2">
      <DndContext
        sensors={sensors}
        onDragStart={(e) => handleDragStart(e, groups, setActiveItem)}
        onDragCancel={handleDragCancel}
        onDragOver={(e) => handleDragOver(e, setGroups)}
        onDragEnd={(e) => handleDragEnd(e, setGroups, setActiveItem)}
      >
        <SortableContext
          id="groups"
          items={groups}
          strategy={verticalListSortingStrategy}
        >
          {groups.map((group) => (
            <SortableItem key={group.id} id={group.id}>
              {({ listeners, attributes, isDragging }) => (
                <li
                  className={`flex flex-col gap-2 ${isDragging ? "opacity-50" : "opacity-100"}`}
                >
                  <div className="flex items-center gap-2">
                    <Icon
                      {...listeners}
                      {...attributes}
                      className="cursor-grab"
                      icon="draggable"
                    />
                    <span>{capitalize(group.name)}</span>
                    {group.name !== "recept" && (
                      <Icon
                        icon="delete"
                        onClick={() => setGroups(removeGroup(groups, group.id))}
                      />
                    )}
                    <SearchModal
                      title="vara"
                      addIcon
                      onSearch={searchItem}
                      onSubmit={async (i) => {
                        const item = newIng({
                          ingredientId: i.id,
                          unit: i.unit,
                          quantity: i.quantity,
                          name: i.name,
                          group: { ...group, recipeId },
                        });
                        setGroups(
                          insertIngredientToGroup({
                            groups,
                            groupName: group.name,
                            item,
                          }),
                        );
                      }}
                    />
                  </div>
                  <Droppable item={group} setItems={setGroups} />
                </li>
              )}
            </SortableItem>
          ))}
        </SortableContext>
        <DragOverlay>
          {activeItem ? <Overlay item={activeItem} /> : null}
        </DragOverlay>
      </DndContext>
    </ul>
  );
};

type OverlayProps = { item: NonNullable<SetActive> };
const Overlay = ({ item }: OverlayProps) => {
  if (item?.ingredients) {
    return (
      <li className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Icon className="cursor-grabbing" icon="draggable" />
          <span>{capitalize(item.name)}</span>
        </div>
        <ul className="space-y-1 p-1">
          {item.ingredients.map((i) => (
            <li
              className="bg-c2 flex w-full items-center gap-2 rounded-md p-1"
              key={i.id}
            >
              <Icon className="cursor-grabbing" icon="draggable" />
              <Item
                item={i}
                edit={<Icon icon="edit" />}
                remove={<Icon icon="delete" />}
              />
            </li>
          ))}
        </ul>
      </li>
    );
  }
  return (
    <li className="flex items-center gap-2">
      <Icon className="cursor-grabbing" icon="draggable" />
      <span>{capitalize(item.name)}</span>
    </li>
  );
};

export default SortableIngredients;
