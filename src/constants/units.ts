const units = [
  "st",
  "g",
  "kg",
  "dl",
  "krm",
  "tsk",
  "msk",
  "ml",
  "cl",
  "l",
  "klyfta",
  "pkt",
  "burk",
  "port",
] as const;

export const unitsAbbr = {
  st: "Antal",
  g: "Gram",
  kg: "Kilogram",
  dl: "Deciliter",
  krm: "Kryddmått",
  tsk: "Tesked",
  msk: "Matsked",
  ml: "Milliliter",
  cl: "Centiliter",
  l: "Liter",
  klyfta: "Klyftor",
  pkt: "Paket",
  burk: "Burkar",
  port: "Portioner",
} as const;

export default units;
