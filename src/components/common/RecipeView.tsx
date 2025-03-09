"use client";

import Link from "next/link";
import { type ReactNode, useState } from "react";
import Icon from "~/icons/Icon";
import { unitsAbbr } from "~/lib/constants/units";
import { capitalize, decimalToFraction } from "~/lib/utils";
import type { Recipe } from "~/server/shared";

type Props = { recipe: Recipe; children?: ReactNode };
const RecipeView = ({
  children,
  recipe: { id, quantity, unit, name, groups, instruction, isPublic },
}: Props) => {
  return (
    <section className="bg-c3 flex flex-col gap-2 p-2">
      <div className="bg-c2 flex items-center justify-between rounded-md px-1">
        <h1 className="text-c5 grow text-xl font-bold">
          <Link href={`/recipes/${id}`}>{name}</Link>
        </h1>
        <div className="flex items-center gap-2">
          {isPublic && <Icon icon="user" />}
          <Link href={`/recipes/${id}/edit`}>
            <Icon icon="edit" className="h-8" />
          </Link>
        </div>
      </div>
      <div className="flex justify-between">
        <h2 className="text-c5 text-lg">{unitsAbbr[unit]}:</h2>
        <p className="bg-c2 text-c5 w-10 rounded-md text-center">{quantity}</p>
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="text-c5 text-lg">Ingredienser</h2>
        <ul>
          {groups.map((group) => (
            <li key={group.id}>
              <h3>{capitalize(group.name)}</h3>
              <ul className="bg-c4 flex flex-col gap-1 rounded-md p-1">
                {group.ingredients.map((ing) => (
                  <Ingredient key={ing.id} {...ing} />
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="text-c5 text-lg">Instruktion</h2>
        <form className="bg-c2 text-c5 rounded-md p-2">
          <ul className="flex flex-col gap-1">
            {instruction.split("\n\n").map((i, index) => (
              <InstructionItem item={i} key={id + index} />
            ))}
          </ul>
        </form>
      </div>
      {children}
    </section>
  );
};

const Ingredient = ({
  ingredient,
  quantity,
  unit,
}: Recipe["groups"][number]["ingredients"][number]) => {
  const [checked, setChecked] = useState(false);
  return (
    <li
      onClick={() => setChecked((p) => !p)}
      className={`bg-c2 text-c4 md:hover:bg-c3 flex cursor-pointer justify-between rounded-md p-1 px-2 select-none ${
        checked && "bg-c3"
      }`}
    >
      <div className="flex items-center gap-2">
        <div
          className={`border-c4 flex size-3 items-center justify-center rounded-[3px] border ${
            checked ? "bg-c4" : "bg-c1"
          }`}
        ></div>
        <p>{capitalize(ingredient.name)}</p>
      </div>
      <div className="flex gap-1">
        <p>{decimalToFraction(quantity)}</p>
        <p>{unit}</p>
      </div>
    </li>
  );
};

const InstructionItem = ({ item }: { item: string }) => {
  const [done, setDone] = useState(false);
  if (!!item) {
    return (
      <li
        onClick={() => setDone((p) => !p)}
        className={`md:hover:bg-c3 flex cursor-pointer gap-2 rounded-md p-1 ${
          done && "bg-c3"
        }`}
      >
        <div
          className={`border-c4 mt-1 flex size-3 shrink-0 items-center justify-center rounded-[3px] border ${
            done ? "bg-c4" : "bg-c1"
          }`}
        ></div>
        <p
          className={`whitespace-pre-wrap select-none ${
            done && "line-through"
          }`}
        >
          {done
            ? item
                .split(/[\s,.;:!?()\b]+/)
                .filter((word) => word.trim() !== "")
                .slice(0, 2)
                .join(" ") + "..."
            : item}
        </p>
      </li>
    );
  }
};

export default RecipeView;
