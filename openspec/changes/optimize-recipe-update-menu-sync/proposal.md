## Why

Recipe saves can time out on Vercel when a user edits ingredients on a recipe that is also present on the menu. The current update path performs targeted recipe/item writes and then still runs a broad menu resync for ingredient changes, which adds avoidable database and graph traversal work before the save redirects.

## What Changes

- Add regression coverage for the observed recipe edit flow: two ingredient groups, multiple quantity edits, one added ingredient, reorder within a group, no child recipes, and an existing menu row.
- Optimize recipe updates so direct ingredient edits, additions, removals, and order changes update affected recipe and menu rows without unnecessary full graph resync.
- Preserve full menu resync behavior for changes that affect recipe graph scaling, such as recipe base quantity changes and contained recipe add/edit/remove.
- Keep existing server action inputs and route behavior unchanged.

## Capabilities

### New Capabilities

- `recipe-menu-sync`: Covers how recipe updates keep menu-backed shopping items synchronized while avoiding unnecessary work.

### Modified Capabilities

## Impact

- Affected code: `src/server/api/recipes.ts`, recipe/menu sync helpers under `src/server/recipes/`, and `src/server/api/recipes.spec.ts`.
- No public API, database schema, dependency, or UI contract changes are expected.
- Main risk is preserving scaled menu item quantities for recipes added to the menu with quantities different from the recipe base quantity.
