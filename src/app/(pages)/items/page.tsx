"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import EditIngredient from "~/app/_components/EditIngredient";
import SearchIngredients from "~/app/_components/SearchIngredient";
import EditItemHome from "~/app/(pages)/items/components/EditItemHome";
import { api } from "~/trpc/react";

const Items = () => {
  const router = useRouter();
  const { data: session } = useSession();
  if (!session) {
    router.push("/");
  }
  const {
    data: items,
    isSuccess,
    isLoading,
    isError,
    refetch,
  } = api.item.getAll.useQuery();
  const { mutate: add } = api.item.add.useMutation({
    onSuccess: () => {
      refetch();
    },
  });
  const { mutate: remove } = api.item.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });
  const { mutate: edit } = api.item.edit.useMutation({
    onSuccess: () => {
      refetch();
    },
  });
  const { mutate: addHome } = api.home.add.useMutation({
    onSuccess: () => {
      refetch();
    },
  });
  const { mutate: removeHome } = api.home.remove.useMutation({
    onSuccess: () => {
      refetch();
    },
  });
  const handleHome = (isHome: boolean, ingredientId: string) => {
    isHome ? removeHome({ ingredientId }) : addHome({ ingredientId });
  };

  return (
    <div className="flex flex-col gap-2 p-2">
      <SearchIngredients
        onSubmit={({ ingredientId, name }) => add({ name, ingredientId })}
      />
      <div className="rounded-md bg-c3 p-3">
        <h2 className="text-c5">Extra varor:</h2>
        <ul className="flex flex-col gap-2">
          {isSuccess &&
            items
              .filter((i) => !!!i.recipe)
              .map((item) => (
                <EditIngredient
                  key={item.id}
                  ingredient={item}
                  onEdit={edit}
                  onRemove={remove}
                />
              ))}
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
        </ul>
      </div>
    </div>
  );
};

export default Items;
