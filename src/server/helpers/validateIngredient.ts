import Fuse from "fuse.js";
import { z } from "zod";
import units from "~/constants/units";
import { RouterOutputs } from "~/trpc/shared";

type Ingredient = RouterOutputs["recipe"]["getById"]["ingredients"][number] & {
  ok: boolean;
};
type Props = {
  data: { name: string; id: string }[];
  ing: { name: string; unit: string; quantity: number };
};
const validateIngredient = ({ data, ing }: Props): Ingredient => {
  const fuse = new Fuse(data, { keys: ["name"] });
  const name = fuse.search(ing.name)[0];
  const unit = units.find((unit) => ing.unit === unit.toLowerCase());
  const ingredient = { name, quantity: ing.quantity, unit };
  const parsed = z
    .object({
      unit: z.enum(units).optional(),
      name: z.string().min(1),
      quantity: z.number().optional(),
    })
    .safeParse(ingredient);
  if(!parsed.success){
    if(parsed.error.formErrors.fieldErrors.name)
  }

  return { id: crypto.randomUUID(), name };
};
