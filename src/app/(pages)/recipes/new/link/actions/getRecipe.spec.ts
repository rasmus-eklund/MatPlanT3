import { expect, test, describe } from "bun:test";
import { getNestedRecipe } from "./getRecipe";

describe("getNestedRecipe", () => {
  test("parses standard ld+json recipe", async () => {
    const ldJson = JSON.stringify({
      "@context": "http://schema.org/",
      "@type": "Recipe",
      name: "Test Recipe",
      recipeIngredient: ["ingredient 1", "ingredient 2"],
      recipeInstructions: [
        { type: "HowToStep", text: "Step 1" },
        { type: "HowToStep", text: "Step 2" },
      ],
      recipeYield: "4",
    });
    const result = await getNestedRecipe(ldJson);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.name).toBe("Test Recipe");
      expect(result.data.recipeInstructions).toEqual(["Step 1", "Step 2"]);
    }
  });

  test("parses flat instruction recipe", async () => {
    const ldJson = JSON.stringify({
      "@context": "http://schema.org/",
      "@type": "Recipe",
      name: "Flat Recipe",
      recipeIngredient: ["ingredient 1"],
      recipeInstructions: ["Only one step"],
      recipeYield: "2",
    });
    const result = await getNestedRecipe(ldJson);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.recipeInstructions).toEqual(["Only one step"]);
    }
  });

  test("parses recipe from @graph array", async () => {
    const ldJson = JSON.stringify({
      "@context": "http://schema.org/",
      "@graph": [
        {
          "@type": "Recipe",
          name: "Graph Recipe",
          recipeIngredient: ["ingredient"],
          recipeInstructions: [{ type: "HowToStep", text: "Graph Step" }],
        },
      ],
    });
    const result = await getNestedRecipe(ldJson);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.name).toBe("Graph Recipe");
      expect(result.data.recipeInstructions).toEqual(["Graph Step"]);
    }
  });

  test("parses recipe with nested itemListElement from @graph array", async () => {
    const ldJson = JSON.stringify({
      "@context": "http://schema.org/",
      "@graph": [
        {
          "@type": "Recipe",
          name: "Nested Graph Recipe",
          recipeIngredient: ["ingredient"],
          recipeInstructions: {
            type: ["ItemList"],
            itemListElement: [
              {
                type: ["HowToStep"],
                text: "Nested Step",
                url: "http://example.com",
              },
            ],
          },
        },
      ],
    });
    const result = await getNestedRecipe(ldJson);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.name).toBe("Nested Graph Recipe");
      expect(result.data.recipeInstructions).toEqual(["Nested Step"]);
    }
  });

  test("returns error when graph is missing recipe", async () => {
    const ldJson = JSON.stringify({
      "@context": "http://schema.org/",
      "@graph": [
        {
          "@type": "WebPage",
          name: "Not a recipe",
        },
      ],
    });
    const result = await getNestedRecipe(ldJson);
    expect(result.ok).toBe(false);
  });
});
