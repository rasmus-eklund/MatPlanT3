"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import Icon from "~/components/common/Icon";
import { updateMenuQuantity } from "~/server/api/menu";
import { unitsAbbr } from "~/lib/constants/units";
import type { MenuItem } from "~/server/shared";

const formSchema = z.object({
  quantity: z.coerce.number<number>().positive(),
});
type Props = { item: MenuItem };

const EditQuantity = ({ item }: Props) => {
  const {
    id,
    recipe: { unit },
    quantity,
  } = item;
  const [open, setOpen] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { quantity },
  });

  const onSubmit = async ({ quantity }: z.infer<typeof formSchema>) => {
    await updateMenuQuantity({ id, quantity });
    setOpen(false);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2">
          <span className="text-xs">
            {quantity} {unitsAbbr[unit]}
          </span>
          <Icon icon="Pencil" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ändra kvantitet</DialogTitle>
          <DialogDescription>
            Detta kommer att skala om varorna i inköpslistan.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id="updateMenuQuantity"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8"
          >
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kvantitet</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter className="flex flex-row justify-between md:justify-end">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Avbryt
            </Button>
          </DialogClose>
          <Button
            disabled={form.formState.isSubmitting}
            form="updateMenuQuantity"
          >
            Spara
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditQuantity;
