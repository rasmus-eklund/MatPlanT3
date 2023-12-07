import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import ICA from "~/server/helpers/scrape/ica";
import ARLA from "~/server/helpers/scrape/arla";

export const externalRouter = createTRPCRouter({
  scrape: protectedProcedure
    .input(z.object({ store: z.enum(["ICA", "ARLA"]), url: z.string().url() }))
    .query(async ({ ctx, input: { url, store } }) => {
      const dbIngs = await ctx.db.ingredient.findMany({
        select: { name: true, id: true },
      });
      if (store === "ICA") {
        return await ICA({ dbIngs, url });
      }
      if (store === "ARLA") {
        return await ARLA({ dbIngs, url });
      }
      throw new TRPCError({ code: "BAD_REQUEST" });
    }),
});
