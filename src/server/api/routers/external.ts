import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import axios from "axios";
import { load } from "cheerio";

export const externalRouter = createTRPCRouter({
  getICA: protectedProcedure
    .input(z.object({ url: z.string().url() }))
    .query(async ({ ctx, input: { url } }) => {
      const dbIngs = await ctx.db.ingredient.findMany({
        select: { name: true, id: true },
      });
      const { data } = await axios.get(url);
      const $ = load(data);
      const recipeName = $("h1").text();
      const ingredients: { quantity: number; unit?: string; name: string }[] =
        [];
      const couldNotMatch: { quantity: number; unit?: string; name: string }[] =
        [];
      const ingDiv = $(".ingredients-list-group.row-noGutter-column");
      ingDiv.find(".ingredients-list-group__card").each((i, el) => {
        const div = $(el);
        const quantUnit = div
          .find(".ingredients-list-group__card__qty")
          .text()
          .trim();
        const match = quantUnit.match(/([\d\/]+)\s*([\s\S]*)/);
        const quantityRaw = match ? match[1] : null;
        const quantity = quantityRaw ? eval(quantityRaw) : null;
        const unit = match ? match[2] : undefined;
        const ingredientName = div
          .find(".ingredients-list-group__card__ingr")
          .text()
          .trim();
      });

      return { name: recipeName, ingredients, couldNotMatch };
    }),
});
