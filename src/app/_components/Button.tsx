import type { ButtonHTMLAttributes, DetailedHTMLProps } from "react";
import { BarLoader } from "react-spinners";

type ButtonProps = {
  callToAction?: boolean;
  className?: string;
  disabled?: boolean;
} & DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

export function Button({
  className: style = "",
  callToAction = false,
  disabled,
  ...props
}: ButtonProps) {
  const className = callToAction
    ? "bg-c4 md:hover:bg-c2 text-c1 md:hover:text-c4 border-c1 active:bg-c2"
    : "bg-c2 md:hover:bg-c4 text-c4 md:hover:text-c2 border-c1 active:bg-c2";
  if (disabled) {
    return <BarLoader />;
  }
  return (
    <button
      className={`${className} ${style} rounded-md border-2 px-2 transition-colors duration-200 disabled:cursor-not-allowed`}
      {...props}
    ></button>
  );
}

export default Button;
