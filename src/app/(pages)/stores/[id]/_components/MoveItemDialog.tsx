"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
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
  FormMessage,
} from "~/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import Icon from "~/icons/Icon";
import type { StoreWithItems } from "~/server/shared";

type Props = {
  currentCategory: string;
  selectedSubcategory: string;
  categories: StoreWithItems["store_categories"];
  onMove: (id: string) => void;
};
const MoveItemDialog = ({
  selectedSubcategory,
  currentCategory,
  categories,
  onMove,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [selectOpen, setSelectOpen] = useState(false);
  const categoryId = z.object({ id: z.string().uuid() });
  type CategoryId = z.infer<typeof categoryId>;
  const form = useForm<CategoryId>({
    resolver: zodResolver(categoryId),
  });
  const onSubmit = (data: CategoryId) => {
    onMove(data.id);
  };
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setSelectOpen(false);
        setOpen(value);
      }}
    >
      <DialogTrigger>
        <Icon className="fill-c4 md:hover:fill-c2 size-5" icon="verticalDots" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Byt kategori</DialogTitle>
              <DialogDescription>
                Flytta{" "}
                <strong className="font-bold">{selectedSubcategory}</strong>{" "}
                från <strong className="font-bold">{currentCategory}</strong>{" "}
                till:
              </DialogDescription>
            </DialogHeader>
            <FormField
              control={form.control}
              name="id"
              render={({ field }) => (
                <FormItem>
                  <Select
                    open={selectOpen}
                    onOpenChange={setSelectOpen}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Välj kategori" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-50 overflow-y-auto md:max-h-100">
                      {categories.map(({ id, category: { name } }) => (
                        <SelectItem key={id} value={id}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="justify-end">
              <Button type="submit">Byt</Button>
              <DialogClose asChild>
                <Button variant="secondary" type="button">
                  Avbryt
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default MoveItemDialog;
