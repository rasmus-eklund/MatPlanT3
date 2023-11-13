"use client";
import Link from "next/link";
import { RouterOutputs } from "~/trpc/shared";
import Icon from "../../assets/icons/Icon";
import { api } from "~/trpc/react";
import LoadingSpinner from "../LoadingSpinner";

type MenuItem = RouterOutputs["menu"]["getAll"][number];
type Props = {
  item: MenuItem;
  update: () => void;
};

const MenuItem = ({ item, update }: Props) => {
  const { id, name, portions } = item;
  const { mutate: remove, isLoading: removing } = api.menu.remove.useMutation({
    onSuccess: update,
  });
  return (
    <li className="flex flex-col gap-2 rounded-md bg-c2 px-2 font-bold text-c5">
      <Link href={`/menu/${id}`} className="w-full">
        {name}
      </Link>
      <div className="flex w-full items-center justify-between gap-1">
        <div className="flex select-none items-center gap-1 p-2">
          <Minus id={id} portions={portions} update={update} />
          <p className="text-lg">{portions}</p>
          <Plus id={id} portions={portions} update={update} />
        </div>
        <button disabled={removing} onClick={() => remove({ id })}>
          {removing ? (
            <LoadingSpinner className="h-5" />
          ) : (
            <Icon
              className="h-6 w-6 fill-c4 md:hover:scale-110 md:hover:fill-c5"
              icon="delete"
            />
          )}
        </button>
      </div>
    </li>
  );
};

type ButtonProps = { id: string; portions: number; update: () => void };
const Plus = ({ id, portions, update }: ButtonProps) => {
  const { mutate, isLoading } = api.menu.changePortions.useMutation({
    onSuccess: update,
  });
  return (
    <button
      disabled={isLoading}
      onClick={() => mutate({ id, portions: portions + 1 })}
    >
      {isLoading ? (
        <LoadingSpinner className="h-5" />
      ) : (
        <Icon
          className="h-6 w-6 fill-c4 md:hover:scale-110 md:hover:fill-c5"
          icon="plus"
        />
      )}
    </button>
  );
};
const Minus = ({ id, portions, update }: ButtonProps) => {
  const { mutate, isLoading } = api.menu.changePortions.useMutation({
    onSuccess: update,
  });
  return (
    <button
      disabled={isLoading}
      onClick={() => {
        const newPortions = Math.max(portions - 1, 1);
        if (newPortions !== portions) {
          mutate({ id, portions: Math.max(portions - 1, 1) });
        }
      }}
    >
      {isLoading ? (
        <LoadingSpinner className="h-5" />
      ) : (
        <Icon
          className="h-6 w-6 fill-c4 md:hover:scale-110 md:hover:fill-c5"
          icon="minus"
        />
      )}
    </button>
  );
};

export default MenuItem;
