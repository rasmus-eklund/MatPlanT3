import { DragDropProvider } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";
import { CollisionPriority } from "@dnd-kit/abstract";
import { useSortable } from "@dnd-kit/react/sortable";
import type { Recipe } from "~/server/shared";
import Icon from "~/components/common/Icon";
import { cn } from "~/lib/utils";
import SearchModal from "~/components/common/SearchModal";
import { searchItem } from "~/server/api/items";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { RestrictToVerticalAxis } from "@dnd-kit/abstract/modifiers";
import { type NameType, nameSchema } from "~/zod/zodSchemas";
import { type User } from "~/server/auth";

type Props = {
  groups: Record<string, Recipe["groups"][number]["ingredients"]>;
  setGroups: (
    groups: Record<string, Recipe["groups"][number]["ingredients"]>,
  ) => void;
  groupsOrder: { id: string; name: string }[];
  setGroupsOrder: (order: { id: string; name: string }[]) => void;
  user: User;
};
const SortableIngredients = ({
  groups,
  setGroups,
  groupsOrder,
  setGroupsOrder,
  user,
}: Props) => {
  const form = useForm<NameType>({
    resolver: zodResolver(nameSchema),
    defaultValues: { name: "" },
    mode: "onSubmit",
    criteriaMode: "all",
    shouldFocusError: true,
  });

  const handleAddGroup = ({ name }: NameType) => {
    if (groupsOrder.map((g) => g.name).includes(name.trim().toLowerCase())) {
      form.setError("name", { message: "Delmoment finns redan" });
      return;
    }
    const id = crypto.randomUUID();
    setGroups({ ...groups, [id]: [] });
    setGroupsOrder([...groupsOrder, { name: name.trim().toLowerCase(), id }]);
    toast.success("Lade till delmoment " + name);
    form.reset();
  };

  const handleRemoveGroup = (groupId: string) => {
    const recept = groupsOrder.find((g) => g.name == "recept");
    const group = groups[groupId];
    if (!recept || !group) {
      return groups;
    }
    groups[recept.id]!.push(...group);
    delete groups[groupId];
    setGroups(groups);
    setGroupsOrder(groupsOrder.filter((g) => g.id !== groupId));
  };

  const handleAddIngredient = ({
    groupId,
    ingredient,
  }: {
    groupId: string;
    ingredient: Omit<Recipe["groups"][number]["ingredients"][number], "order">;
  }) => {
    const groupItems = groups[groupId];
    if (!groupItems) throw new Error("Group not found");
    setGroups({
      ...groups,
      [groupId]: [...groupItems, ingredient].map((i, order) => ({
        ...i,
        order,
      })),
    });
  };

  const handleUpdateIngredient = ({
    groupId,
    id,
    ingredient,
  }: {
    groupId: string;
    id: string;
    ingredient: Recipe["groups"][number]["ingredients"][number];
  }) => {
    const group = groups[groupId];
    if (!group) throw new Error("Group not found");
    setGroups({
      ...groups,
      [groupId]: group.map((i, order) =>
        i.id === id ? { ...i, ...ingredient, order } : i,
      ),
    });
  };

  const handleRemoveIngredientFromGroup = ({
    groupId,
    id,
  }: {
    groupId: string;
    id: string;
  }) => {
    const group = groups[groupId];
    if (!group) throw new Error("Group not found");
    setGroups({
      ...groups,
      [groupId]: group.filter((i) => i.id !== id),
    });
  };

  return (
    <>
      <DragDropProvider
        onDragOver={(event) => {
          const { source } = event.operation;
          if (source?.type === "column") return;
          setGroups(move(groups, event));
        }}
        onDragEnd={(event) => {
          const { source } = event.operation;
          if (event.canceled) return;
          if (source?.type === "column") {
            setGroupsOrder(move(groupsOrder, event));
          }
        }}
      >
        <ul className="flex flex-col gap-2">
          {groupsOrder.map(({ id, name }, groupIndex) => (
            <Group
              user={user}
              key={id}
              group={{ name, id }}
              index={groupIndex}
              handleRemoveGroup={handleRemoveGroup}
              handleAddIngredient={handleAddIngredient}
            >
              {groups[id]?.map((item, index) => (
                <Ingredient
                  key={item.id}
                  item={item}
                  index={index}
                  group={{ name: groupsOrder[groupIndex]!.name, id }}
                  handleUpdateIngredient={handleUpdateIngredient}
                  handleRemoveIngredientFromGroup={
                    handleRemoveIngredientFromGroup
                  }
                  user={user}
                />
              ))}
            </Group>
          ))}
        </ul>
      </DragDropProvider>
      <Form {...form}>
        <form
          className="flex items-end gap-2"
          onSubmit={form.handleSubmit(handleAddGroup)}
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Delmoment</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Lägg till</Button>
        </form>
      </Form>
    </>
  );
};

type GroupProps = {
  group: { name: string; id: string };
  index: number;
  children: React.ReactNode;
  handleAddIngredient: ({
    groupId,
    ingredient,
  }: {
    groupId: string;
    ingredient: Omit<Recipe["groups"][number]["ingredients"][number], "order">;
  }) => void;
  handleRemoveGroup: (groupId: string) => void;
  user: User;
};

const Group = ({
  children,
  group,
  index,
  handleAddIngredient,
  handleRemoveGroup,
  user,
}: GroupProps) => {
  const { ref, handleRef, isDragging } = useSortable({
    id: group.id,
    index,
    type: "column",
    collisionPriority: CollisionPriority.Low,
    accept: ["item", "column"],
    modifiers: [RestrictToVerticalAxis],
  });

  return (
    <li
      ref={ref}
      className={cn("flex flex-col gap-2", isDragging && "opacity-50")}
    >
      <div className="flex items-center gap-2">
        <button ref={handleRef}>
          <Icon className="cursor-grab" icon="GripHorizontal" />
        </button>
        <span className="capitalize">{group.name}</span>
        {group.name !== "recept" && (
          <Icon icon="Trash" onClick={() => handleRemoveGroup(group.id)} />
        )}
        <SearchModal
          user={user}
          title="vara"
          onSearch={searchItem}
          addIcon
          onSubmit={async (i) =>
            handleAddIngredient({
              groupId: group.id,
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
  group: { name: string; id: string };
  handleUpdateIngredient: ({
    groupId,
    id,
    ingredient,
  }: {
    groupId: string;
    id: string;
    ingredient: Recipe["groups"][number]["ingredients"][number];
  }) => void;
  handleRemoveIngredientFromGroup: ({
    groupId,
    id,
  }: {
    groupId: string;
    id: string;
  }) => void;
  user: User;
};

const Ingredient = ({
  item,
  group,
  index,
  handleUpdateIngredient,
  handleRemoveIngredientFromGroup,
  user,
}: IngredientProps) => {
  const { ref, handleRef, isDragging } = useSortable({
    id: item.id,
    index,
    group: group.id,
    type: "item",
    accept: "item",
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
        <Icon className="cursor-grab" icon="GripHorizontal" />
      </button>
      <div className="flex w-full items-center justify-between">
        <span className="capitalize">{item.ingredient.name}</span>
        <div className="flex items-center gap-1">
          <span>{item.quantity}</span>
          <span>{item.unit}</span>
          <SearchModal
            user={user}
            title="vara"
            onSearch={searchItem}
            item={{
              ...item,
              name: item.ingredient.name,
              id: item.ingredientId,
            }}
            onSubmit={async (i) =>
              handleUpdateIngredient({
                groupId: group.id,
                id: item.id,
                ingredient: {
                  quantity: i.quantity,
                  unit: i.unit,
                  ingredient: { name: i.name },
                  id: item.id,
                  order: item.order,
                  groupId: group.id,
                  ingredientId: i.id,
                },
              })
            }
          />
          <button
            onClick={() =>
              handleRemoveIngredientFromGroup({
                groupId: group.id,
                id: item.id,
              })
            }
          >
            <Icon icon="Trash" />
          </button>
        </div>
      </div>
    </li>
  );
};

export default SortableIngredients;
