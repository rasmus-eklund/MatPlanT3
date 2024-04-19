const externalRecipes = {
  ICA: {
    regex: /^https:\/\/www\.ica\.se\/recept\/.+/,
    url: "https://www.ica.se/recept/...",
  },
  ARLA: {
    regex: /^https:\/\/www\.arla\.se\/recept\/.+/,
    url: "https://www.arla.se/recept/...",
  },
} as const;
export default externalRecipes;
