"use client";
import { useState } from "react";
import capitalize from "../helpers/capitalize";
import units from "../constants/units";
import { useForm } from "react-hook-form";
import { tIngredient } from "~/zod/zodSchemas";
import Icon from "../assets/icons/Icon";
import IconStyle from "../assets/icons/standardIconStyle";

type Props = {
  ingredient: tIngredient;
  onEdit: (ingredient: tIngredient) => void;
  onRemove: ({ id }: { id: string }) => void;
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
    <li className="flex items-center justify-between rounded-md bg-c2 p-1 px-2 text-sm text-c4">
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
          <select className="h-5 text-xs" {...register("unit")}>
            {units.map((unit) => (
              <option key={unit}>{unit}</option>
            ))}
          </select>
          <div className="flex gap-2 justify-self-end">
            <button>
              <Icon className={IconStyle} icon="check" />
            </button>
            <Icon
              className={IconStyle}
              icon="close"
              onClick={() => setEdit(false)}
            />
          </div>
        </form>
      ) : (
        <div className="flex items-center gap-2 justify-self-end">
          <p className="whitespace-nowrap"> {`${quantity} ${unit}`}</p>
          <Icon
            className={IconStyle}
            icon="edit"
            onClick={() => setEdit(true)}
          />
          <Icon
            className={IconStyle}
            icon="delete"
            onClick={() => onRemove({ id })}
          />
        </div>
      )}
    </li>
  );
};

export default EditIngredient;
