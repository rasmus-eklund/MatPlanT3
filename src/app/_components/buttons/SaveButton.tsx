import CheckIcon from "../icons/CheckIcon";

type Props = { callback: () => void };

const SaveButton = ({ callback }: Props) => {
  return (
    <div className="flex h-6 cursor-pointer" onClick={() => callback()}>
      <CheckIcon className="fill-c4 hover:scale-125 hover:fill-c5" />
    </div>
  );
};

export default SaveButton;
