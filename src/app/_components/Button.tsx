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
    ? "bg-c1 hover:bg-c5 text-c5 hover:text-c1"
    : "bg-c5 hover:bg-c1 text-c1 hover:text-c5";
  return (
    <button
      className={`${colors} ${className} border-black rounded-md border-2 px-2 transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50`}
      {...props}
    ></button>
  );
}

export default Button;
