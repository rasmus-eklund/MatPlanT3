"use client";

import { useForm } from "react-hook-form";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "~/components/ui/dialog";
import Icon from "~/components/common/Icon";
import type { Item } from "~/server/shared";

import { useState } from "react";
import { Textarea } from "~/components/ui/textarea";
import { addComment, deleteComment, updateComment } from "~/server/api/items";
import type { User } from "~/server/auth";

type Comment = Item["comments"];
type Props = {
  comment: Comment;
  item: { id: string; name: string };
  user: User;
};
const Comment = (props: Props) => {
  const { user } = props;
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const form = useForm<{ comment: string }>({
    defaultValues: { comment: props.comment ? props.comment.comment : "" },
  });
  const handleRemove = async () => {
    if (props.comment) {
      setDeleting(true);
      await deleteComment({
        commentId: props.comment.id,
        user,
        name: props.item.name,
      });
      setDeleting(false);
    }
    form.setValue("comment", "");
    form.reset();
    setOpen(false);
  };
  const onSubmit = async ({ comment }: { comment: string }) => {
    if (props.comment) {
      await updateComment({
        comment,
        commentId: props.comment.id,
        name: props.item.name,
        user,
      });
    } else {
      await addComment({ comment, item: props.item, user });
    }
    setOpen(false);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        {props.comment ? (
          <Icon icon="MessageSquareText" />
        ) : (
          <Icon icon="MessageSquarePlus" />
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="first-letter:capitalize">
            {props.item.name}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription>Kommentar</DialogDescription>
        <Form {...form}>
          <form
            id="comment-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8"
          >
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea required {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter className="flex flex-row justify-end gap-2">
          {props.comment && (
            <Button
              variant="destructive"
              type="button"
              disabled={deleting}
              onClick={handleRemove}
            >
              Ta bort
            </Button>
          )}
          <Button
            disabled={
              form.formState.isSubmitting ||
              !form.formState.isDirty ||
              !form.formState.isValid
            }
            form="comment-form"
            type="submit"
          >
            Spara
          </Button>
          <DialogClose asChild>
            <Button variant="secondary" type="button">
              Avbryt
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Comment;
