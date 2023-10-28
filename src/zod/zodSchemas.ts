import { z } from "zod";

export const zId = z.object({ id: z.string().min(1) });
export type Tid = z.infer<typeof zId>;

export const zStoreName = z
  .string()
  .min(1, "Store name should be minimum 1 character.");
export type tStoreName = z.infer<typeof zStoreName>;

export const zStoreNameId = z.object({
  name: zStoreName,
  id: z.string().min(1),
});
export type tStoreNameId = z.infer<typeof zStoreNameId>;

export const zStoreOrder = z.array(
  z.object({
    categoryId: z.number().min(1),
    subcategoryId: z.number().min(1),
  }),
);
export type tStoreOrder = z.infer<typeof zStoreOrder>;
