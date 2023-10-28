"use client";
import { useState } from "react";
import TrashIcon from "../icons/TrashIcon";
import durations from "~/app/constants/animationDurations";

type Props = { callback: () => void };

const DeleteButton = ({ callback }: Props) => {
  const [animate, setAnimate] = useState(false);
  const handleClick = () => {
    setAnimate((prev) => {
      setTimeout(() => {
        callback();
        setAnimate((prev) => !prev);
      }, durations.deleteItem);
      return !prev;
    });
  };
  return (
    <button onClick={handleClick}>
      <TrashIcon
        className={`h-6 cursor-pointer fill-c4 transition-all ease-in-out hover:scale-125 hover:fill-c5 ${
          animate && "scale-0"
        }`}
      />
    </button>
  );
};

export default DeleteButton;
