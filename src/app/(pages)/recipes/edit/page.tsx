"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "~/app/_components/Button";
import RecipeForm from "~/app/(pages)/recipes/components/RecipeForm";
import { api } from "~/trpc/react";
import { RouterOutputs } from "~/trpc/shared";
import { useForm } from "react-hook-form";
type Recipe = RouterOutputs["recipe"]["getById"];

const CreateRecipePage = () => {
  const router = useRouter();
  const { mutate: createRecipe, isLoading: creatingRecipe } =
    api.recipe.create.useMutation({
      onSuccess: (id) => {
        router.push(`/recipes/search/${id}`);
        router.refresh();
      },
    });
  const newRecipe: Recipe = {
    recipe: {
      id: "placeholder",
      name: "Nytt recept",
      portions: 2,
      instruction: "Instruktion",
      isPublic: false,
    },
    contained: [],
    ingredients: [],
    yours: true,
  };
  const [url, setUrl] = useState<string>("");
  const { data, isSuccess, isFetching, isStale } = api.external.getICA.useQuery(
    { url },
    { enabled: !!url },
  );
  const { handleSubmit, register } = useForm<{ url: string }>();

  return (
    <>
      {isSuccess && (
        <div className="flex flex-col gap-2">
          <h1>{data.name}</h1>
          <h2>Ingredienser</h2>
          <ul>
            {data.ingredients.map(({ name, quantity, unit }) => (
              <li className="flex gap-1" key={name}>
                <p>{name}</p>
                {quantity && <p>{quantity}</p>}
                {unit && <p>{unit}</p>}
              </li>
            ))}
          </ul>
          <h2>Kunde inte matcha</h2>
          <ul>
            {data.couldNotMatch.map(({ name, quantity, unit }) => (
              <li className="flex gap-1" key={name}>
                <p>{name}</p>
                {quantity && <p>{quantity}</p>}
                {unit && <p>{unit}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}
      {isFetching && <p>Laddar...</p>}
      {isStale && !isSuccess && <p>Klistra in länk</p>}
      <form
        onSubmit={handleSubmit(({ url }) => {
          setUrl(url);
        })}
      >
        <input {...register("url")} />
        <button>Hämta</button>
      </form>
      <RecipeForm
        loading={creatingRecipe}
        recipe={newRecipe}
        onSubmit={createRecipe}
      >
        <Button disabled={creatingRecipe} form="recipe-form">
          Skapa recept
        </Button>
      </RecipeForm>
    </>
  );
};

export default CreateRecipePage;
