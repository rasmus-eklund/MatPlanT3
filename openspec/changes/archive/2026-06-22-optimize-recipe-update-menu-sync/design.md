## Context

`updateRecipe` currently updates recipe rows, recipe ingredient rows, and linked menu `items`, then calls `resyncRecipeMenuItems` whenever ingredients changed. That resync reloads recipe graphs and rebuilds expected menu item snapshots for direct and parent menu rows. For a direct recipe edit with no contained recipes, this duplicates work and can push a server action toward Vercel timeout before the redirect is returned.

## Goals / Non-Goals

**Goals:**

- Keep recipe saves correct for recipes already added to the menu.
- Reduce database round trips and graph traversal for direct ingredient edits, additions, removals, and reorders.
- Preserve scaled menu item quantities for menu rows whose quantity differs from the recipe base quantity.
- Add regression coverage for the reported phone save scenario.

**Non-Goals:**

- Change the recipe form UI, DnD behavior, server action signature, or database schema.
- Replace the existing full graph resync path for contained recipe changes.
- Add background jobs or asynchronous post-save synchronization.

## Decisions

- Use a direct-sync path for direct ingredient changes. When only direct ingredients/groups changed and the recipe base quantity and contained recipes did not change, update affected recipe-backed `items` from the edited/added/removed ingredient diff and matching menu rows. Alternative considered: always use full `resyncRecipeMenuItems`; rejected because it repeats graph loading for the common direct-edit case.
- Apply menu quantity scaling during direct sync. For each affected menu row, compute `menu.quantity / recipe.quantity` and apply that scale to changed or added ingredient quantities. Alternative considered: copy raw recipe quantities to linked items; rejected because existing tests require differently scaled menu rows to stay correct.
- Keep full resync for graph-affecting changes. Base recipe quantity changes and contained recipe changes continue through `resyncRecipeMenuItems` because they can affect descendants, ancestors, and all item quantities. Alternative considered: incrementally handling every graph case; rejected as higher risk and unnecessary for the reported timeout.
- Batch where it reduces round trips without obscuring behavior. Prefer `inArray` deletes and SQL `CASE` updates for item rows when practical, while keeping the code easy to audit.

## Risks / Trade-offs

- Direct sync could miss an ancestor menu row if parent recipes contain the edited recipe. Mitigation: include direct recipe menu rows and parent recipe menu rows when inserting/updating recipe-backed items.
- Scaling bugs could alter shopping item quantities. Mitigation: keep existing scaled-menu tests and add a scenario with multiple edits plus an inserted ingredient.
- Skipping full resync may leave stale items if the direct path is applied to contained recipe changes. Mitigation: gate the optimization strictly to changes with no recipe quantity change and no contained add/edit/remove.
