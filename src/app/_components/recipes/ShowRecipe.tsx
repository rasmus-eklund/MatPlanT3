"use client";
import { Recipe } from "@/types";
import { FC } from "react";
import Link from "next/link";
import { capitalize } from "../../utils/utils";

type ShowRecipeProps = {
  recipe: Recipe;
  children?: React.ReactNode;
};

const ShowRecipe: FC<ShowRecipeProps> = ({ recipe, children }) => {
  return (
    <section className="bg-c3 p-5 flex flex-col gap-5">
      <h1 className="text-c5 bg-c3 text-3xl font-bold">{recipe.name}</h1>
      <div className="rounded-md bg-c4 p-2 flex flex-col gap-2">
        <div className="flex justify-between">
          <h2 className="text-c2 text-lg">Portioner:</h2>
          <p className="rounded-md w-10 text-center text-c5 bg-c3">
            {recipe.portions}
          </p>
        </div>
        <div className="flex flex-col bg-c4 gap-1">
          <h2 className="text-c2 text-lg">Ingredienser</h2>
          <ul className="bg-c3 p-1 rounded-md flex flex-col gap-1">
            {recipe.ingredients.map(({ name, quantity, unit, id }) => (
              <li className="bg-c2 p-1 rounded-md" key={id}>
                <div className="flex justify-between text-c4">
                  <p>{capitalize(name)}</p>
                  <div className="flex gap-1">
                    <p>{quantity}</p>
                    <p> {unit}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {recipe.children.length !== 0 && (
            <>
              <h2 className="text-c2 text-lg">Länkade recept</h2>
              <ul className="bg-c3 p-1 rounded-md flex flex-col gap-1">
                {recipe.children.map((rec) => (
                  <li className="bg-c2 p-1 rounded-md" key={rec.id}>
                    <div className="flex justify-between text-c4">
                      <Link className="text-lg" href={`/recipes/${rec.id}`}>
                        {rec.name}
                      </Link>
                      <p className="text-c5">{rec.portions} Portioner</p>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
        <div className="flex flex-col">
          <h2 className="text-c2 text-lg">Instruktion</h2>
          <p className="bg-c3 text-c5 rounded-md p-2 whitespace-pre-wrap">
            {recipe.instruction}
          </p>
        </div>
        <div className="flex justify-between items-center">{children}</div>
      </div>
    </section>
  );
};

export default ShowRecipe;
