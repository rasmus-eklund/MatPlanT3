"use client";
import Link from "next/link";
import { RouterOutputs } from "~/trpc/shared";
import Icon from "~/icons/Icon";
import { api } from "~/trpc/react";
import { useEffect, useState } from "react";
import { useDebounce } from "usehooks-ts";

type MenuItem = RouterOutputs["menu"]["getAll"][number];
type Props = {
  item: MenuItem;
};

const MenuItem = ({ item }: Props) => {
  const [portions, setPortions] = useState(item.portions);
  const debouncedPortions = useDebounce(portions, 500);
  const { id, name } = item;
  const utils = api.useUtils();
  const { mutate: remove, isLoading: removing } = api.menu.remove.useMutation({
    onSuccess: () => utils.menu.getAll.invalidate(),
  });
  const { mutate: changePortions, isLoading: changingPortions } =
    api.menu.changePortions.useMutation({
      onSuccess: () => utils.menu.getAll.invalidate(),
    });

  useEffect(() => {
    console.log("new portions " + debouncedPortions);
    changePortions({ id, portions: debouncedPortions });
  }, [debouncedPortions]);

  return (
    <li className="flex flex-col gap-2 rounded-md bg-c2 px-2 font-bold text-c5">
      <Link href={`/menu/${id}`} className="w-full">
        {name}
      </Link>
      <div className="flex w-full items-center justify-between gap-1">
        <div className="flex select-none items-center gap-1 p-2">
          <button
            disabled={changingPortions}
            onClick={() => {
              const newPortions = Math.max(portions - 1, 1);
              if (newPortions !== portions) {
                setPortions(newPortions);
              }
            }}
          >
            <Icon
              className={`h-6 w-6 fill-c4 md:hover:scale-110 md:hover:fill-c5 ${
                changingPortions && "fill-c2"
              }`}
              icon="minus"
            />
          </button>
          <p className="text-lg">{portions}</p>
          <button
            disabled={changingPortions}
            onClick={() => setPortions(portions + 1)}
          >
            <Icon
              className={`h-6 w-6 fill-c4 md:hover:scale-110 md:hover:fill-c5 ${
                changingPortions && "fill-c2"
              }`}
              icon="plus"
            />
          </button>
        </div>
        <button disabled={removing} onClick={() => remove({ id })}>
          <Icon
            className={`h-6 w-6 fill-c4 md:hover:scale-110 md:hover:fill-c5 ${
              removing && "fill-c2"
            }`}
            icon="delete"
          />
        </button>
      </div>
    </li>
  );
};

export default MenuItem;
