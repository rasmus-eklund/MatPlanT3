"use client";
import { useState } from "react";
import capitalize from "../utils/capitalize";
import units from "../constants/units";
import { useForm } from "react-hook-form";
import { tIngredient } from "~/zod/zodSchemas";
import Icon from "./icons/Icon";
import svgPath from "./icons/svgPaths";

type Props = {
  ingredient: tIngredient;
  onEdit: (ingredient: tIngredient) => void;
  onRemove: (id: string) => void;
};

const EditIngredient = ({
  ingredient: { id, name, quantity, unit, ingredientId },
  onEdit,
  onRemove,
}: Props) => {
  const [edit, setEdit] = useState(false);
  const { register, handleSubmit } = useForm<tIngredient>({
    defaultValues: { id, name, quantity, unit, ingredientId },
  });

  return (
    <li className="flex items-center justify-between rounded-md bg-c2 p-1 text-sm text-c4">
      <p className="grow">{capitalize(name)}</p>
      {edit ? (
        <form
          className="flex items-center gap-2"
          onSubmit={handleSubmit((i) => {
            onEdit(i);
            setEdit(false);
          })}
        >
          <input className="w-10 min-w-0" {...register("quantity")} />
          <select className="text-xs" {...register("unit")}>
            {units.map((unit) => (
              <option key={unit}>{unit}</option>
            ))}
          </select>
          <div className="flex gap-2 justify-self-end">
            <button>
              <Icon d={svgPath.check} />
            </button>
            <Icon d={svgPath.close} onClick={() => setEdit(false)} />
          </div>
        </form>
      ) : (
        <div className="flex items-center gap-2 justify-self-end">
          <p> {`${quantity} ${unit}`}</p>
          <Icon d={svgPath.edit} onClick={() => setEdit(true)} />
          <Icon d={svgPath.delete} onClick={() => onRemove(id)} />
        </div>
      )}
    </li>
  );
};

export default EditIngredient;
