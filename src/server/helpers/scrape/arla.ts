import axios from "axios";
import validateIngredient from "../validateIngredient";
import { load } from "cheerio";
import { Ingredient, Unit } from "types";

type Props = { url: string; dbIngs: { name: string; id: string }[] };
const ARLA = async ({ url, dbIngs }: Props) => {
  const { data } = await axios.get(url);
  const $ = load(data);
  const recipeName = $("h1").text();
  const instructions: string[] = [];
  $(".c-recipe__instructions-steps")
    .find("li")
    .each((i, el) => {
      const step = $(el).last().text().trim();
      instructions.push(step);
    });
  const instruction = instructions.join("\n\n");
  const quantity = 2;
  const unit: Unit = "port";
  const ingredients: Ingredient[] = [];
  const couldNotMatch: { quantity: string; unit: string; name: string }[] = [];
  $(".c-recipe__ingredients-inner")
    .find("tr")
    .each((i, el) => {
      let [quantity, unit] = ["1", "st"];
      let name: string = "";
      const spans = $(el).find("th span").last();
      name = $(spans)
        .text()
        .trim()
        .replace("Svenskt Smör från Arla®", "smör")
        .replace("Arla Ko®", "")
        .replace("Arla Köket®", "")
        .replace("Arla®", "")
        .split(",")[0]!;

      const quantUnit = $(el).find("td").text().trim();
      const match = quantUnit.match(/(\d+(\s*[\d⅛⅙⅕¼⅓⅜½⅔⅚¾⅞½]+)?)\s*([^\d]+)/);
      if (match) {
        if (match[1]) {
          try {
            const number = match[1];
            const fractionMap: [string, number][] = [
              ["⅛", 1 / 8],
              ["⅙", 1 / 6],
              ["⅕", 1 / 5],
              ["¼", 1 / 4],
              ["⅓", 1 / 3],
              ["⅜", 3 / 8],
              ["⅖", 2 / 5],
              ["½", 1 / 2],
              ["⅔", 2 / 3],
              ["⅚", 5 / 6],
              ["¾", 3 / 4],
              ["⅞", 7 / 8],
            ];
            fractionMap.forEach(([fraction, value]) =>
              number.replace(fraction, ` ${value}`),
            );
            quantity = number.split(" ").reduce((sum, cur) => sum + cur);
          } catch (error) {
            console.log("Could not extract quantity");
            console.log({ quantity: match[1] });
          }
        }
        if (match[3]) {
          unit = match[3];
        }
      }
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
    unit,
    quantity,
  };
};

export default ARLA;
