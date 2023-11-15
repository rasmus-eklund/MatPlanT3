"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import EditIngredient from "~/app/_components/EditIngredient";
import SearchIngredients from "~/app/_components/SearchIngredient";
import EditItemHome from "~/app/(pages)/items/components/EditItemHome";
import { api } from "~/trpc/react";
import Icon from "~/icons/Icon";
import Button from "~/app/_components/Button";

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

  const { mutate: deleteAll } = api.item.deleteAll.useMutation({
    onSuccess: () => refetch(),
  });

  return (
    <div className="flex flex-col gap-2 p-2">
      <SearchIngredients
        onSubmit={({ ingredientId, name }) => add({ name, ingredientId })}
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
                <EditIngredient
                  key={item.id}
                  ingredient={item}
                  onEdit={edit}
                  onRemove={remove}
                >
                  <Icon
                    icon="home"
                    className={`h-6 w-6 rounded-md bg-c3 ${
                      item.home
                        ? "fill-c5 md:hover:fill-c2"
                        : "fill-c2 md:hover:fill-c5"
                    }`}
                    onClick={() => handleHome(item.home, item.ingredientId)}
                  />
                </EditIngredient>
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
