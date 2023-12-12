import Fuse from "fuse.js";
import { z } from "zod";
import units from "~/constants/units";
import { RouterOutputs } from "~/trpc/shared";

type Success = { success: true; ingredient: Ingredient };
type Fail = {
  success: false;
  ingredient: { name: string; unit: string; quantity: string };
};
type Ingredient = RouterOutputs["recipe"]["getById"]["ingredients"][number];
type Props = {
  data: { name: string; id: string }[];
  ing: { name: string; unit: string; quantity: string };
};
const validateIngredient = ({ data, ing }: Props): Success | Fail => {
  const fuse = new Fuse(data, { keys: ["name"], threshold: 0.5 });
  const unit = units.find((unit) => ing.unit === unit.toLowerCase());
  const names = fuse.search(ing.name);
  const ingredient = {
    name: ing.name,
    quantity: ing.quantity,
    unit: unit ?? ing.unit,
  };
  if (!names[0]) {
    return { success: false, ingredient };
  }
  const { id, name } = names[0].item;
  const parsed = z
    .object({
      unit: z.enum(units),
      name: z.string().min(1),
      quantity: z.coerce.number(),
    })
    .safeParse({ name, quantity: ing.quantity, unit: ing.unit });
  if (!parsed.success) {
    return {
      success: false,
      ingredient: { name, quantity: ing.quantity, unit: ing.unit },
    };
  }
  return {
    success: true,
    ingredient: {
      id: crypto.randomUUID(),
      ingredientId: id!,
      ...parsed.data,
      order: 0,
      group: null,
    },
  };
};

export default validateIngredient;
