"use client";
import { useForm } from "react-hook-form";
import type { UserSession } from "~/server/shared";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { createAccountSchema, type CreateAccount } from "~/zod/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { createAccount } from "~/server/api/users";

type Props = {
  user: NonNullable<UserSession>;
};

const RegisterUserForm = ({ user }: Props) => {
  const form = useForm<CreateAccount>({
    defaultValues: {
      name: `${user.given_name ?? "Förnamn"} ${user.family_name ?? "Efternamn"}`,
      email: user.email ?? "email",
    },
    resolver: zodResolver(createAccountSchema),
  });

  const onSubmit = async ({ email, name }: CreateAccount) => {
    await createAccount({
      email,
      name,
      image: user.picture,
      authId: user.authId,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Användarnamn</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>Detta är ditt användarnamn.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Epost address</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>Detta är din epost address.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button disabled={form.formState.isSubmitting} type="submit">
          Registrera
        </Button>
      </form>
    </Form>
  );
};

export default RegisterUserForm;
