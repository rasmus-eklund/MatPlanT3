import {
  Pizza,
  User,
  Notebook,
  X,
  ArrowRight,
  ArrowLeft,
  Trash,
  Utensils,
  MenuSquare,
  ShoppingCart,
  Store,
  MessageSquareText,
  MessageSquarePlus,
  Pencil,
  HandHelping,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Ellipsis,
  GripHorizontal,
  EllipsisVertical,
  Star,
  Refrigerator,
  Plus,
  UserCog,
  LogOut,
  ListFilterPlus,
  ListFilter,
  Check,
  Square,
  Menu,
} from "lucide-react";
import type { ComponentProps, ComponentType } from "react";
import { cn } from "~/lib/utils";

const iconMap = {
  Pizza,
  User,
  Notebook,
  X,
  ArrowRight,
  ArrowLeft,
  Trash,
  Utensils,
  MenuSquare,
  ShoppingCart,
  Store,
  MessageSquareText,
  MessageSquarePlus,
  Pencil,
  HandHelping,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Ellipsis,
  GripHorizontal,
  EllipsisVertical,
  Star,
  Refrigerator,
  Plus,
  UserCog,
  LogOut,
  ListFilterPlus,
  ListFilter,
  Check,
  Square,
  Menu,
} as const;

type IconComponent = ComponentType<{
  className?: string;
}>;
export type IconName = {
  [K in keyof typeof iconMap]: (typeof iconMap)[K] extends IconComponent ? K : never;
}[keyof typeof iconMap];

type IconProps = ComponentProps<(typeof iconMap)[IconName]>;
type Props = IconProps & {
  icon: IconName;
};

const Icon = ({ icon, className, ...props }: Props) => {
  const LucideIcon = iconMap[icon] as IconComponent;
  return <LucideIcon {...props} className={cn("size-4", className)} />;
};

export default Icon;
