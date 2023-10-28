import PlusIcon from "../icons/PlusIcon";

type Props = { callback: () => void };

const PlusButton = ({ callback }: Props) => {
  return (
    <div className="flex h-6 cursor-pointer" onClick={() => callback()}>
      <PlusIcon className="fill-c5 hover:scale-125" />
    </div>
  );
};

export default PlusButton;
