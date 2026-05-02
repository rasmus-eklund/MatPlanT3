import { cn } from "~/lib/utils";
import {
  Select as SelectShad,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import type { ReactNode } from "react";

type Option = { key: string; value: string; label: ReactNode };

type Props = {
  options: Option[];
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
} & React.ComponentProps<typeof SelectShad>;

const Select = ({
  options,
  className,
  placeholder = "Välj",
  triggerClassName,
  ...props
}: Props) => {
  return (
    <SelectShad {...props}>
      <SelectTrigger className={cn("w-full", triggerClassName)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent
        className={cn("max-h-50 overflow-y-auto md:max-h-100", className)}
      >
        {options.map((option) => (
          <SelectItem key={option.key} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectShad>
  );
};

export default Select;
