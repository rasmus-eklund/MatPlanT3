"use client";
import Link from "next/link";
import { RouterOutputs } from "~/trpc/shared";
import Icon from "~/icons/Icon";
import { api } from "~/trpc/react";
import { useEffect, useState } from "react";
import { useDebounce } from "usehooks-ts";
import { Day } from "types";
import days from "~/constants/days";
import { ClipLoader } from "react-spinners";

type MenuItem = RouterOutputs["menu"]["getAll"][number];
type Props = {
  item: MenuItem;
};

const MenuItem = ({ item }: Props) => {
  const [portions, setPortions] = useState(item.portions);
  const debouncedPortions = useDebounce(portions, 1000);
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
    if (item.portions !== debouncedPortions) {
      changePortions({ id, portions: debouncedPortions });
    }
  }, [debouncedPortions]);

  return (
    <li className="flex flex-col gap-2 rounded-md bg-c2 px-2 font-bold text-c5">
      <div>
        <Link prefetch={false} href={`/menu/${id}`}>
          {name}
        </Link>
      </div>
      <div className="flex w-full select-none items-center gap-2 py-2 md:justify-between">
        <div className="flex grow items-center gap-[1px]">
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
              className={`h-8 w-8 fill-c4 md:hover:scale-110 md:hover:fill-c5 ${
                changingPortions && "fill-c2"
              }`}
              icon="minus"
            />
          </button>
          {changingPortions ? (
            <ClipLoader size={16} />
          ) : (
            <p className="w-4 text-center text-lg">{portions}</p>
          )}
          <button
            disabled={changingPortions}
            onClick={() => setPortions(portions + 1)}
          >
            <Icon
              className={`h-8 w-8 fill-c4 md:hover:scale-110 md:hover:fill-c5 ${
                changingPortions && "fill-c2"
              }`}
              icon="plus"
            />
          </button>
        </div>
        <DaysDropDown id={item.id} initDay={item.day as Day} />
        {removing ? (
          <ClipLoader size={20} />
        ) : (
          <button disabled={removing} onClick={() => remove({ id })}>
            <Icon
              className={`h-6 w-6 fill-c4 md:hover:scale-110 md:hover:fill-c5 ${
                removing && "fill-c2"
              }`}
              icon="delete"
            />
          </button>
        )}
      </div>
    </li>
  );
};

type DropProp = {
  id: string;
  initDay: Day;
};

const DaysDropDown = ({ id, initDay }: DropProp) => {
  const utils = api.useUtils();
  const {
    mutate: changeDay,
    isLoading,
    isError,
  } = api.menu.changeDay.useMutation({
    onSuccess: () => utils.menu.getAll.invalidate(),
  });
  return (
    <>
      {isLoading ? (
        <ClipLoader size={18}/>
      ) : (
        <select
          className="cursor-pointer rounded-md border-2 border-c3 bg-c2 px-2 py-1 text-c5 hover:bg-c5 hover:text-c2"
          value={initDay}
          onChange={(e) => {
            const newDay = e.target.value as Day;
            if (newDay !== initDay) {
              changeDay({ day: newDay, id });
            }
          }}
        >
          {days.map((day, i) => (
            <option key={day + i} value={day}>
              {day}
            </option>
          ))}
        </select>
      )}
      {isError && <p>Något gick fel...</p>}
    </>
  );
};

export default MenuItem;
