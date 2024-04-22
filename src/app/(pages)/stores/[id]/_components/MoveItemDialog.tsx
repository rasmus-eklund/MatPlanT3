"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useForm } from "react-hook-form";
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
import type { CategoryItem } from "~/types";
import { type tName, zName } from "~/zod/zodSchemas";

type Props = {
  currentCategory: string;
  selectedSubcategory: string;
  categories: CategoryItem[];
  onMove: (id: string) => void;
};
const MoveItemDialog = ({
  selectedSubcategory,
  currentCategory,
  categories,
  onMove,
}: Props) => {
  const form = useForm<tName>({
    resolver: zodResolver(zName),
  });
  const onSubmit = (data: tName) => {
    onMove(data.name);
  };
  return (
    <Dialog>
      <DialogTrigger>
        <Icon
          className="size-5 fill-c4 md:hover:scale-110 md:hover:fill-c2"
          icon="verticalDots"
        />
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Välj kategori" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map(({ id, name }) => (
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
