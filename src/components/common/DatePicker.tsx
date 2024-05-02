"use client";

import { Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn, dateToString } from "~/lib/utils";

type Props = {
  date: Date | undefined;
  setDate: (date: string) => Promise<void>;
};
const DatePicker = ({ date, setDate }: Props) => {
  const [open, setOpen] = useState(false);
  const handleChange = async (newDate: Date | undefined) => {
    if (newDate) {
      await setDate(dateToString(newDate));
    }
    setOpen(false);
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-fit justify-start text-left font-normal",
            !date && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? dateToString(date) : <span>Välj datum</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          weekStartsOn={1}
          selected={date}
          onSelect={handleChange}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};

export default DatePicker;
