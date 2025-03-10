"use client";

import { Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";
import { ClipLoader } from "react-spinners";
import { toast } from "sonner";
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
  setDate: (date: string | null) => Promise<void>;
};
const DatePicker = ({ date, setDate }: Props) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleChange = async (newDate: Date | null | undefined) => {
    if (newDate ?? newDate === null) {
      setIsSubmitting(true);
      setOpen(false);
      try {
        await setDate(newDate ? dateToString(newDate) : null);
        toast.success("Datum ändrat!");
      } catch (error) {
        toast.error("Något gick fel...");
      }
      setIsSubmitting(false);
    }
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          disabled={isSubmitting}
          variant={"outline"}
          className={cn(
            "w-fit justify-start text-left font-normal",
            !date && "text-muted-foreground",
          )}
        >
          {isSubmitting ? (
            <ClipLoader size={20} className="mr-2" />
          ) : (
            <CalendarIcon className="mr-2 size-4" />
          )}
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
          footer={
            <div className="flex justify-end py-2">
              <button
                disabled={isSubmitting}
                onClick={async () => handleChange(null)}
              >
                Ta bort
              </button>
            </div>
          }
        />
      </PopoverContent>
    </Popover>
  );
};

export default DatePicker;
