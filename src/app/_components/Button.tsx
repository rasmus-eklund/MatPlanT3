import type { ButtonHTMLAttributes, DetailedHTMLProps } from "react";

type ButtonProps = {
  inverted?: boolean;
  className?: string;
} & DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

export function Button({
  className = "",
  inverted = false,
  ...props
}: ButtonProps) {
  const colors = inverted
    ? "bg-c1 hover:bg-c4 text-c5 hover:text-c2 border-c5"
    : "bg-c4 hover:bg-c2 text-c1 hover:text-c5 border-c1";
  return (
    <button
      className={`${colors} ${className} rounded-md border-2 px-2 transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50`}
      {...props}
    ></button>
  );
}

export default Button;
