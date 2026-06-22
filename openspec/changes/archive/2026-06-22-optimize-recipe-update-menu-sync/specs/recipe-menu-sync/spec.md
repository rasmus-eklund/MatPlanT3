## ADDED Requirements

### Requirement: Direct recipe ingredient updates synchronize menu items efficiently

The system SHALL persist direct recipe ingredient edits, additions, removals, and order changes for recipes that are present on the menu without requiring a full recipe graph resync when the recipe base quantity and contained recipes are unchanged.

#### Scenario: Multi-group direct edit with added and reordered ingredient

- **WHEN** a user updates a recipe with two groups by editing multiple ingredient quantities, adding an ingredient to the second group, reordering that new ingredient within the second group, and saving while the recipe is on the menu with no child recipes
- **THEN** the recipe ingredient rows reflect the edited quantities, added ingredient, and final ingredient order
- **THEN** menu-backed item rows for that recipe reflect the edited and added ingredients without timing out

### Requirement: Direct synchronization preserves menu quantity scaling

The system SHALL scale edited and added direct recipe ingredients for each existing menu row according to that menu row's quantity relative to the recipe base quantity.

#### Scenario: Scaled menu rows receive scaled direct ingredient changes

- **WHEN** a recipe has multiple menu rows with different quantities and a direct ingredient quantity or unit is edited
- **THEN** each linked menu item is updated with the correct scaled quantity, unit, and ingredient identity

#### Scenario: New direct ingredients are inserted for existing scaled menu rows

- **WHEN** a direct ingredient is added to a recipe that already has menu rows
- **THEN** each affected menu row receives one recipe-backed item for the new ingredient with the correct scaled quantity

### Requirement: Graph-affecting recipe changes continue full menu resync

The system SHALL continue to run full recipe menu item resynchronization when changes affect recipe graph scaling or composition.

#### Scenario: Contained recipe change affects menu items

- **WHEN** a recipe's contained recipes are added, removed, or edited
- **THEN** direct and ancestor menu rows are resynchronized so child-derived items are added, removed, or rescaled correctly

#### Scenario: Recipe base quantity change affects menu items

- **WHEN** a recipe's base quantity changes
- **THEN** existing recipe-backed menu items are rescaled correctly for affected menu rows
