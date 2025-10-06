import * as Lucide from "lucide-react";
import type { ComponentProps, ComponentType } from "react";
import { cn } from "../../lib/utils";

type IconComponent = ComponentType<{
  className?: string;
}>;
export type IconName = {
  [K in keyof typeof Lucide]: (typeof Lucide)[K] extends IconComponent
    ? K
    : never;
}[keyof typeof Lucide];

type IconProps = ComponentProps<(typeof Lucide)[IconName]>;
type Props = IconProps & {
  icon: IconName;
};

const Icon = ({ icon, className, ...props }: Props) => {
  const LucideIcon = Lucide[icon] as IconComponent;
  return (
    <LucideIcon
      {...props}
      className={cn("size-4 hover:scale-105", className)}
    />
  );
};

export default Icon;
