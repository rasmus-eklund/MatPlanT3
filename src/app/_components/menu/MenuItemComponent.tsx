"use client";
import Link from "next/link";
import Incrementer from "./Incrementer";
import { RouterOutputs } from "~/trpc/shared";
import Icon from "../icons/Icon";
import { api } from "~/trpc/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

type MenuItem = RouterOutputs["menu"]["getAll"][number];
type Props = {
  item: MenuItem;
};

const MenuItem = ({ item: { id, name, portions } }: Props) => {
  const router = useRouter();
  const { mutate: remove, isLoading: removing } = api.menu.remove.useMutation({
    onSuccess: () => {
      router.refresh();
    },
  });
  const { mutate: changePortions, isLoading: changingPortions } =
    api.menu.changePortions.useMutation();
  const [port, setPort] = useState(portions);
  return (
    <li className="flex  items-center justify-between gap-2 rounded-md bg-c2 px-2 font-bold text-c5">
      <Link
        href={`/menu/${id}`}
        className="overflow-ellipsis whitespace-nowrap"
      >
        {name}
      </Link>
      <div className="flex items-center justify-between gap-1">
        <Incrementer
          value={port}
          disabled={changingPortions}
          callback={(value) => {
            if (value !== port) {
              setPort(value);
              changePortions({ id, portions: value });
            }
          }}
        />
        <button disabled={removing} onClick={() => remove({ id })}>
          <Icon
            className="h-6 w-6 fill-c4 hover:scale-110 hover:fill-c5"
            icon="delete"
          />
        </button>
      </div>
    </li>
  );
};

export default MenuItem;
