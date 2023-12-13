"use client";
import { ReactNode, useState } from "react";
import capitalize from "../helpers/capitalize";
import units from "../../constants/units";
import { useForm } from "react-hook-form";
import { tIngredient } from "~/zod/zodSchemas";
import Icon from "~/icons/Icon";
import IconStyle from "../../icons/standardIconStyle";
import { ClipLoader } from "react-spinners";

type Props = {
  ingredient: tIngredient;
  onEdit: (ingredient: tIngredient) => void;
  onRemove: () => void;
  removing?: boolean;
  loading?: boolean;
  className?: string;
  children?: ReactNode;
};

const EditIngredient = ({
  ingredient: { id, name, quantity, unit, ingredientId },
  onEdit,
  onRemove,
  removing,
  className,
  loading = false,
  children,
}: Props) => {
  const [edit, setEdit] = useState(false);
  const { register, handleSubmit } = useForm<tIngredient>({
    defaultValues: { id, name, quantity, unit, ingredientId },
  });
  return (
    <li
      className={`flex items-center justify-between rounded-md bg-c2 p-1 text-sm text-c4 transition-opacity duration-300 ${className} ${
        removing && "opacity-0"
      }`}
    >
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
        <div className="flex items-center gap-2">
          {children}
          {loading ? (
            <ClipLoader size={20} />
          ) : (
            <>
              <p className="whitespace-nowrap"> {`${quantity} ${unit}`}</p>
              <Icon
                className={IconStyle}
                icon="edit"
                onClick={() => setEdit(true)}
              />
            </>
          )}
          <Icon className={IconStyle} icon="delete" onClick={onRemove} />
        </div>
      )}
    </li>
  );
};

export default EditIngredient;
