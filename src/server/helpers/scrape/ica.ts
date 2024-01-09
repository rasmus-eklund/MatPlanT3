import axios from "axios";
import validateIngredient from "../validateIngredient";
import { load } from "cheerio";
import { Ingredient } from "types";

type Props = { url: string; dbIngs: { name: string; id: string }[] };
const ICA = async ({ url, dbIngs }: Props) => {
  const { data } = await axios.get(url);
  const $ = load(data);
  const recipeName = $("h1").text();
  const instructions: string[] = [];
  $(".cooking-steps-group")
    .find(".cooking-steps-card")
    .each((i, el) => {
      const step = $(el).find(".cooking-steps-main__text").text().trim();
      instructions.push(step);
    });
  const instruction = instructions.join("\n\n");
  const portions = 2;
  const ingredients: Ingredient[] = [];
  const couldNotMatch: { quantity: string; unit: string; name: string }[] = [];
  const ingDiv = $(".ingredients-list-group.row-noGutter-column");
  ingDiv.find(".ingredients-list-group__card").each((i, el) => {
    let [quantity, unit] = ["1", "st"];
    const div = $(el);
    const quantUnit = div
      .find(".ingredients-list-group__card__qty")
      .text()
      .trim();
    const match = quantUnit.match(/(\d*\s*\d*\/?\d*)\s*(\S*)/);
    if (match) {
      if (match[1]) {
        try {
          const numbers = match[1].trim().split(/\s/);
          if (numbers.length > 1) {
            quantity = eval(numbers.join("+"));
          } else {
            quantity = eval(match[1]);
          }
        } catch (error) {
          console.log("Could not extract quantity");
          console.log({ quantity: match[1] });
        }
      }
      if (match[2]) {
        unit = match[2];
      }
    }
    const name = div.find(".ingredients-list-group__card__ingr").text().trim();
    const ing = validateIngredient({
      data: dbIngs,
      ing: { name, quantity, unit: unit ?? "" },
    });
    if (ing.success) {
      ingredients.push({ ...ing.ingredient, order: i });
    } else {
      couldNotMatch.push(ing.ingredient);
    }
  });
  const couldNotMatchPlusInstruction = !!couldNotMatch
    ? [
        "Ingredienser som inte kunde extraheras:",
        couldNotMatch
          .map(({ name, quantity, unit }) => `${quantity} ${unit} ${name}`)
          .join("\n"),
        instruction,
      ].join("\n\n")
    : instruction;
  return {
    name: recipeName,
    instruction: couldNotMatchPlusInstruction,
    ingredients,
    portions,
  };
};

export default ICA;
