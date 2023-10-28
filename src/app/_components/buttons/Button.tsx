"use client";
import { useState } from "react";
import durations from "~/app/constants/animationDurations";

type Props = {
  name: string;
  callback: () => void;
};

const Button = ({ name, callback }: Props) => {
  const [animate, setAnimate] = useState(false);
  const handleClick = () => {
    setAnimate((prev) => {
      setTimeout(() => {
        callback();
        setAnimate((prev) => !prev);
      }, durations.button);
      return !prev;
    });
  };
  return (
    <button
      disabled={animate}
      className={`cursor-pointer rounded-md border-2 border-c2 bg-c2 px-2 text-c5 transition-all md:hover:bg-c5 md:hover:text-c2 ${
        animate && "scale-110"
      }`}
      onClick={handleClick}
    >
      {name}
    </button>
  );
};

export default Button;
