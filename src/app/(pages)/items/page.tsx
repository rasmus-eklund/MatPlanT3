"use client";
import EditIngredient from "~/app/_components/EditIngredient";
import SearchIngredients from "~/app/_components/SearchIngredient";
import EditItemHome from "~/app/(pages)/items/components/EditItemHome";
import { api } from "~/trpc/react";
import Icon from "~/icons/Icon";
import Button from "~/app/_components/Button";
import { tIngredient } from "~/zod/zodSchemas";
import { ReactNode } from "react";

const Items = () => {
  const utils = api.useUtils();
  const {
    data: items,
    isSuccess,
    isLoading,
    refetch,
  } = api.item.getAll.useQuery();
  const { mutate: add } = api.item.add.useMutation({
    onSuccess: () => {
      refetch();
    },
  });
  const { mutate: remove } = api.item.delete.useMutation({
    onMutate: async ({ id }) => {
      await utils.item.getAll.cancel();
      const prevData = utils.item.getAll.getData();
      utils.item.getAll.setData(undefined, (old) => {
        if (old) {
          return old.filter((i) => i.id !== id);
        }
        return [];
      });
      return prevData;
    },
    onError: (err, updatedItem, ctx) => {
      utils.item.getAll.setData(undefined, ctx);
    },
    onSettled: () => {
      utils.item.getAll.invalidate();
    },
  });

  const { mutate: addHome } = api.home.add.useMutation({
    onMutate: async ({ ingredientId }) => {
      await utils.item.getAll.cancel();
      const prevData = utils.item.getAll.getData();
      utils.item.getAll.setData(undefined, (old) => {
        if (old) {
          return old.map((i) =>
            i.ingredientId === ingredientId ? { ...i, home: true } : i,
          );
        }
        return [];
      });
      return prevData;
    },
    onError: (err, updatedItem, ctx) => {
      utils.item.getAll.setData(undefined, ctx);
    },
    onSettled: () => {
      utils.item.getAll.invalidate();
    },
  });
  const { mutate: removeHome } = api.home.remove.useMutation({
    onMutate: async ({ ingredientId }) => {
      await utils.item.getAll.cancel();
      const prevData = utils.item.getAll.getData();
      utils.item.getAll.setData(undefined, (old) => {
        if (old) {
          return old.map((i) =>
            i.ingredientId === ingredientId ? { ...i, home: false } : i,
          );
        }
        return [];
      });
      return prevData;
    },
    onError: (err, updatedItem, ctx) => {
      utils.item.getAll.setData(undefined, ctx);
    },
    onSettled: () => {
      utils.item.getAll.invalidate();
    },
  });
  const handleHome = (isHome: boolean, ingredientId: string) => {
    isHome ? removeHome({ ingredientId }) : addHome({ ingredientId });
  };

  const { mutate: deleteAll } = api.item.deleteAll.useMutation({
    onMutate: async () => {
      await utils.item.getAll.cancel();
      const prevData = utils.item.getAll.getData();
      utils.item.getAll.setData(undefined, () => []);
      return prevData;
    },
    onError: (err, updatedItem, ctx) => {
      utils.item.getAll.setData(undefined, ctx);
    },
    onSettled: () => {
      utils.item.getAll.invalidate();
    },
  });

  return (
    <div className="flex flex-col gap-2 p-2">
      <SearchIngredients
        onSubmit={({ ingredientId }) => add({ id: ingredientId })}
      />
      <div className="flex flex-col gap-2 rounded-md bg-c3 p-3">
        <div className="flex justify-between">
          <h2 className="text-c5">Extra varor:</h2>
          <Button onClick={() => deleteAll()}>Ta bort alla</Button>
        </div>
        <ul className="flex flex-col gap-2">
          {isSuccess &&
            items
              .filter((i) => !i.recipe)
              .map((item) => (
                <Ingredient key={item.id} ingredient={item} onRemove={remove}>
                  <Icon
                    icon="home"
                    className={`h-6 w-6 rounded-md bg-c3 ${
                      item.home
                        ? "fill-c5 md:hover:fill-c2"
                        : "fill-c2 md:hover:fill-c5"
                    }`}
                    onClick={() => handleHome(item.home, item.ingredientId)}
                  />
                </Ingredient>
              ))}
          {isLoading && <Shimmer />}
        </ul>
      </div>
      <div className="rounded-md bg-c3 p-3">
        <h2 className="text-c5">Recept varor:</h2>
        <ul className="flex flex-col gap-2">
          {isSuccess &&
            items
              .filter((i) => i.recipe)
              .map((item) => (
                <EditItemHome
                  key={item.id}
                  ingredient={item}
                  onHome={(home) => handleHome(home, item.ingredientId)}
                />
              ))}
          {isLoading && <Shimmer recipe />}
        </ul>
      </div>
    </div>
  );
};

type IngProps = {
  ingredient: tIngredient;
  onRemove: ({ id }: { id: string }) => void;
  loading?: boolean;
  children?: ReactNode;
};
const Ingredient = (props: IngProps) => {
  const { children, ...rest } = props;
  const utils = api.useUtils();
  const { mutate: edit, isLoading: editing } = api.item.edit.useMutation({
    onSuccess: () => {
      utils.item.getAll.invalidate();
    },
  });
  return (
    <EditIngredient loading={editing} onEdit={edit} {...rest}>
      {children}
    </EditIngredient>
  );
};

const Shimmer = ({ recipe = false }: { recipe?: boolean }) => {
  return (
    <>
      {Array(4)
        .fill(1)
        .map((_, i) => (
          <li
            key={"item-shimmer-" + i}
            className="flex h-8 w-full animate-pulse justify-between rounded-md bg-c2 p-1"
          >
            <div className="h-full w-1/4 rounded-md bg-c3/40"></div>
            <div className="flex gap-2">
              <div className="h-full w-6 rounded-md bg-c3/40"></div>
              <div className="h-full w-6 rounded-md bg-c3/40"></div>
              {recipe && <div className="h-full w-6 rounded-md bg-c3/40"></div>}
              {recipe && <div className="h-full w-6 rounded-md bg-c3/40"></div>}
            </div>
          </li>
        ))}
    </>
  );
};
export default Items;
