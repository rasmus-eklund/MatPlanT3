import EditIcon from "../icons/IconTemplate";

type Props = { callback: () => void };

const EditButton = ({ callback }: Props) => {
  return (
    <div className="flex h-6 cursor-pointer" onClick={() => callback()}>
      <EditIcon className="fill-c4 transition-all hover:scale-125 hover:fill-c5" />
    </div>
  );
};

export default EditButton;
