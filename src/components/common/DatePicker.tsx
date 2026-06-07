"use client";

import { Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn, dateToString } from "~/lib/utils";
import { Spinner } from "../ui/spinner";

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
      } catch {
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
          variant="outline"
          size="sm"
          className={cn("w-fit text-xs", !date && "text-muted-foreground")}
        >
          {date ? dateToString(date) : <span>Välj datum</span>}
          {isSubmitting ? (
            <Spinner className="mr-2" />
          ) : (
            <CalendarIcon className="mr-2 size-4" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="bg-c4 size-fit">
        <Calendar
          mode="single"
          weekStartsOn={1}
          selected={date}
          onSelect={handleChange}
          className="bg-c3"
          autoFocus
          footer={
            <div className="flex justify-end py-2">
              {date && (
                <Button
                  disabled={isSubmitting}
                  onClick={async () => handleChange(null)}
                >
                  Ta bort datum
                </Button>
              )}
            </div>
          }
        />
      </PopoverContent>
    </Popover>
  );
};

export default DatePicker;
