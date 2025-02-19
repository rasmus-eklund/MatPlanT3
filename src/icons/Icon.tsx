import type { RefObject, SVGProps } from "react";
import svgPaths from "./svgPaths";
import { cn } from "../lib/utils";

export type tIcon = keyof typeof svgPaths;
type Props = SVGProps<SVGElement> & {
  ref?: RefObject<SVGSVGElement | null>;
  icon: tIcon;
};

const Icon = ({ icon, className, ...rest }: Props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={cn(
        "fill-c5 size-6 cursor-pointer transition-all duration-200 md:hover:scale-110",
        className,
      )}
      {...rest}
    >
      <path d={svgPaths[icon]} />
    </svg>
  );
};

export default Icon;
