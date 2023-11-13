"use client";
import capitalize from "~/app/helpers/capitalize";
import { RouterOutputs } from "~/trpc/shared";
import Icon from "~/app/assets/icons/Icon";
type Item = RouterOutputs["item"]["getAll"][number];
type Props = {
  ingredient: Item;
  onHome: (home: boolean) => void;
};

const EditItemHome = ({
  ingredient: { name, quantity, unit, home },
  onHome,
}: Props) => {
  return (
    <li className="flex items-center justify-between rounded-md bg-c2 p-1 text-sm text-c4">
      <p className="grow">{capitalize(name)}</p>
      <div className="flex items-center gap-2 justify-self-end">
        <p> {`${quantity} ${unit}`}</p>
        <Icon
          icon="home"
          className={`h-6 w-6 rounded-md bg-c3 ${
            home ? "fill-c5 md:hover:fill-c2" : "fill-c2 md:hover:fill-c5"
          }`}
          onClick={() => onHome(home)}
        />
      </div>
    </li>
  );
};

export default EditItemHome;
