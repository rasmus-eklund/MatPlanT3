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
      recipeIngredient: ["ingredient 1", "ingredient 2"],
      recipeInstructions: ["Step 1", "Step 2"],
      recipeYield: "2",
    });
    const result = await getNestedRecipe(ldJson);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.recipeInstructions).toEqual(["Step 1", "Step 2"]);
    }
  });

  test("parses recipe from @graph array", async () => {
    const ldJson = JSON.stringify({
      "@context": "http://schema.org/",
      "@graph": [
        {
          "@type": "WebPage",
          name: "Page",
        },
        {
          "@type": "Recipe",
          name: "Graph Recipe",
          recipeIngredient: ["ingredient 1", "ingredient 2"],
          recipeInstructions: [
            { type: "HowToStep", text: "Graph Step 1" },
            { type: "HowToStep", text: "Graph Step 2" },
          ],
        },
      ],
    });
    const result = await getNestedRecipe(ldJson);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.name).toBe("Graph Recipe");
      expect(result.data.recipeInstructions).toEqual([
        "Graph Step 1",
        "Graph Step 2",
      ]);
    }
  });

  test("parses recipe with nested itemListElement from @graph array", async () => {
    const ldJson = JSON.stringify({
      "@context": "http://schema.org/",
      "@graph": [
        {
          "@type": "WebPage",
          name: "Page",
        },
        {
          "@type": "Recipe",
          name: "Nested Graph Recipe",
          recipeIngredient: ["ingredient 1", "ingredient 2"],
          recipeInstructions: {
            type: ["HowToSection", "ItemList"],
            itemListElement: [
              {
                type: ["HowToStep", "Action"],
                text: "Nested Step 1",
                url: "http://example.com/1",
              },
              {
                type: ["HowToStep", "Action"],
                text: "Nested Step 2",
                url: "http://example.com/2",
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
      expect(result.data.recipeInstructions).toEqual([
        "Nested Step 1",
        "Nested Step 2",
      ]);
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
