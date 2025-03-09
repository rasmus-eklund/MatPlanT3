import React, { useRef } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";
import { CollisionPriority } from "@dnd-kit/abstract";
import { useSortable } from "@dnd-kit/react/sortable";
import type { Recipe } from "~/server/shared";
import Icon from "~/icons/Icon";
import { capitalize, cn } from "~/lib/utils";
import { useSortableIngredientsStore } from "~/stores/sortableIngredientsStore";
import SearchModal from "~/components/common/SearchModal";
import { searchItem } from "~/server/api/items";

const SortableIngredients = () => {
  const { groups, setGroups, groupsOrder, setGroupsOrder } =
    useSortableIngredientsStore();
  const previousGroups = useRef(groups);

  return (
    <DragDropProvider
      onDragStart={() => {
        previousGroups.current = groups;
      }}
      onDragOver={(event) => {
        const { source } = event.operation;
        if (source?.type === "column") return;
        setGroups(move(groups, event));
      }}
      onDragEnd={(event) => {
        const { source } = event.operation;
        if (event.canceled) {
          if (source?.type === "item") {
            setGroups(previousGroups.current);
          }
          return;
        }
        if (source?.type === "column") {
          setGroupsOrder(move(groupsOrder, event));
        }
      }}
    >
      <ul className="flex flex-col gap-2">
        {groupsOrder.map((group, groupIndex) => (
          <Group key={group.id} group={group} index={groupIndex}>
            {groups[group.name]!.map((item, index) => (
              <Ingredient
                key={item.id}
                item={item}
                index={index}
                groupId={group.id}
              />
            ))}
          </Group>
        ))}
      </ul>
    </DragDropProvider>
  );
};

type GroupProps = {
  group: { name: string; id: string };
  index: number;
  children: React.ReactNode;
};
const Group = ({ children, group, index }: GroupProps) => {
  const { removeGroup, addIngredientToGroup } = useSortableIngredientsStore();
  const { ref, handleRef, isDragging } = useSortable({
    id: group.id,
    index,
    type: "column",
    collisionPriority: CollisionPriority.Low,
    accept: ["item", "column"],
  });
  return (
    <li
      ref={ref}
      className={cn("flex flex-col gap-2", isDragging && "opacity-50")}
    >
      <div className="flex items-center gap-2">
        <button ref={handleRef}>
          <Icon className="cursor-grab" icon="draggable" />
        </button>
        <span>{capitalize(group.name)}</span>
        {group.name !== "recept" && (
          <Icon icon="delete" onClick={() => removeGroup(group.name)} />
        )}
        <SearchModal
          title="vara"
          onSearch={searchItem}
          addIcon
          onSubmit={async (i) =>
            addIngredientToGroup({
              groupName: group.name,
              ingredient: {
                quantity: i.quantity,
                unit: i.unit,
                id: crypto.randomUUID(),
                ingredient: { name: i.name },
                ingredientId: i.id,
                groupId: group.id,
              },
            })
          }
        />
      </div>
      <ul className="min-h-10 space-y-1 border p-1">{children}</ul>
    </li>
  );
};

type IngredientProps = {
  item: Recipe["groups"][number]["ingredients"][number];
  index: number;
  groupId: string;
};
const Ingredient = ({ item, groupId, index }: IngredientProps) => {
  const { ref, handleRef, isDragging } = useSortable({
    id: item.id,
    index,
    group: groupId,
    type: "item",
    accept: ["item"],
  });

  return (
    <li
      className={cn(
        "bg-c2 flex w-full items-center justify-between gap-2 rounded-md p-1",
        isDragging && "opacity-50",
      )}
      ref={ref}
    >
      <button ref={handleRef}>
        <Icon className="cursor-grab" icon="draggable" />
      </button>
      <div className="flex w-full items-center justify-between">
        <span>{capitalize(item.ingredient.name)}</span>
        <div className="flex items-center gap-1">
          <span>{item.quantity}</span>
          <span>{item.unit}</span>
          <SearchModal
            title="vara"
            onSearch={searchItem}
            item={{ ...item, name: item.ingredient.name }}
            onSubmit={async () => console.log("hi")}
          />
          <button onClick={() => console.log("hi")}>
            <Icon icon="delete" />
          </button>
        </div>
      </div>
    </li>
  );
};

export default SortableIngredients;
