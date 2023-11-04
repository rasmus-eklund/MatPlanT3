import type { RefObject, SVGProps } from "react";
import type { Ticon } from "types";
import svgPaths from "./svgPaths";

type Props = SVGProps<SVGElement> & {
  ref?: RefObject<SVGSVGElement>;
  icon: Ticon;
  reversed?: boolean;
  className?: string;
};

const Icon = ({ icon, className, reversed = false, ...rest }: Props) => {
  const colors = reversed ? "fill-c5 hover:fill-c4" : "fill-c4 hover:fill-c5";
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      {...rest}
      className={`h-6 hover:scale-125 ${colors} ${className}`}
    >
      <path d={svgPaths[icon]} />
    </svg>
  );
};

export default Icon;
