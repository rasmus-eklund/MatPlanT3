import { RefObject, SVGProps } from "react";

type Props = SVGProps<SVGElement> & {
  ref?: RefObject<SVGSVGElement>;
  d: string;
  reversed?: boolean;
  className?: string;
};

const Icon = ({ d, className, reversed = false, ...rest }: Props) => {
  const colors = reversed ? "fill-c5 hover:fill-c4" : "fill-c5 hover:fill-c4";
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      {...rest}
      className={`h-6 hover:scale-125 ${colors} ${className}`}
    >
      <path d={d} />
    </svg>
  );
};

export default Icon;
