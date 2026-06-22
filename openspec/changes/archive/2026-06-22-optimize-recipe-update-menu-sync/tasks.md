## 1. Regression Coverage

- [x] 1.1 Add a `updateRecipe` backend test for the reported save flow with two groups, 2 ingredients in group A, 7 existing ingredients in group B, one added ingredient reordered to third position, and an existing menu row.
- [x] 1.2 Assert the saved recipe ingredient rows have the expected quantities, group assignments, and order values after the update.
- [x] 1.3 Assert linked menu items are updated or inserted with correct scaled quantities for edited and added ingredients.

## 2. Direct Ingredient Synchronization

- [x] 2.1 Refactor `updateRecipe` to detect direct-only recipe ingredient changes where recipe base quantity and contained recipes are unchanged.
- [x] 2.2 Batch direct recipe ingredient row updates, deletes, and inserts where practical.
- [x] 2.3 Synchronize linked recipe-backed menu `items` for edited, removed, and added direct ingredients using each menu row's quantity scale.
- [x] 2.4 Keep direct ingredient reorder changes scoped to recipe ingredient `order` updates without triggering unnecessary menu item writes.

## 3. Full Resync Boundaries

- [x] 3.1 Preserve `resyncRecipeMenuItems` for recipe base quantity changes.
- [x] 3.2 Preserve `resyncRecipeMenuItems` for contained recipe add/edit/remove changes.
- [x] 3.3 Ensure parent recipe menu rows still receive new direct ingredient items when an edited recipe is contained by a parent recipe.

## 4. Verification

- [x] 4.1 Run `bun test src/server/api/recipes.spec.ts`.
- [x] 4.2 Run `bun test`.
- [x] 4.3 Run `openspec validate optimize-recipe-update-menu-sync`.
