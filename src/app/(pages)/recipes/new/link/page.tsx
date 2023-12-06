"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "~/app/_components/Button";
import RecipeForm from "~/app/(pages)/recipes/components/RecipeForm";
import { api } from "~/trpc/react";
import { useForm } from "react-hook-form";
import { ClipLoader } from "react-spinners";
import { externalRecipe } from "types";
import toast from "react-hot-toast";
import externalRecipes from "~/constants/externalRecipes";

const NewRecipe = () => {
  const router = useRouter();
  const { mutate: createRecipe, isLoading: creatingRecipe } =
    api.recipe.create.useMutation({
      onSuccess: (id) => {
        router.push(`/recipes/search/${id}`);
        router.refresh();
      },
    });
  const [store, setStore] = useState<{
    url: string;
    store: externalRecipe;
  }>({ store: "ICA", url: "" });
  const { data, isSuccess, isFetching, isStale } = api.external.scrape.useQuery(
    store,
    { enabled: !!store.url },
  );

  const { handleSubmit, register, watch } = useForm<{
    url: string;
    store: externalRecipe;
  }>();

  return (
    <>
      {isFetching && <ClipLoader />}
      {isStale && !isSuccess && <p>Klistra in länk</p>}
      <form
        className="flex w-full gap-2 p-2"
        onSubmit={handleSubmit(({ store, url }) => {
          if (!externalRecipes[store].regex.test(url)) {
            toast.error(`Kontrollera din url till ${store}`);
            return;
          }
          setStore({ store, url });
        })}
      >
        <select {...register("store")}>
          {Object.keys(externalRecipes).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <input {...register("url")} />
        <Button callToAction>Hämta</Button>
      </form>
      {isSuccess && (
        <RecipeForm
          recipe={{
            contained: [],
            ingredients: data.ingredients,
            recipe: {
              id: "Placeholder",
              instruction: data.instruction,
              isPublic: false,
              name: data.name,
              portions: data.portions,
            },
            yours: true,
          }}
          onSubmit={createRecipe}
        >
          <Button disabled={creatingRecipe} form="recipe-form">
            Skapa recept
          </Button>
        </RecipeForm>
      )}
    </>
  );
};

export default NewRecipe;
