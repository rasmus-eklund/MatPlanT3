// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { relations } from "drizzle-orm";
import {
  pgTableCreator,
  timestamp,
  uuid,
  text,
  integer,
  real,
  boolean,
  date,
  unique,
  json,
  serial,
  pgEnum,
} from "drizzle-orm/pg-core";
import units from "~/lib/constants/units";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `MatPlan_${name}`);

export const users = createTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  authId: text("authId").notNull().unique(),
  email: text("email").unique().notNull(),
  name: text("name").notNull(),
  image: text("image"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  stores: many(store),
  auditLogs: many(auditLog),
}));

export const category = createTable("category", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
});

export const categoryRelations = relations(category, ({ many }) => ({
  subcategories: many(subcategory),
  ingredients: many(ingredient),
}));

export const subcategory = createTable("subcategory", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  categoryId: integer("categoryId")
    .notNull()
    .references(() => category.id, {
      onDelete: "cascade",
    }),
});

export const subcategoryRelations = relations(subcategory, ({ many, one }) => ({
  category: one(category, {
    fields: [subcategory.categoryId],
    references: [category.id],
  }),
  ingredients: many(ingredient),
}));

export const ingredient = createTable("ingredient", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  categoryId: integer("categoryId")
    .notNull()
    .references(() => category.id, {
      onDelete: "cascade",
    }),
  subcategoryId: integer("subcategoryId")
    .notNull()
    .references(() => subcategory.id, {
      onDelete: "cascade",
    }),
});

export const ingredientRelations = relations(ingredient, ({ one, many }) => ({
  category: one(category, {
    fields: [ingredient.categoryId],
    references: [category.id],
  }),
  subcategory: one(subcategory, {
    fields: [ingredient.subcategoryId],
    references: [subcategory.id],
  }),
  recipes: many(recipe_ingredient),
  homes: many(home),
  items: many(items),
}));

export const home = createTable("home", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  ingredientId: uuid("ingredientId").references(() => ingredient.id, {
    onDelete: "cascade",
  }),
});

export const homeRelations = relations(home, ({ one }) => ({
  ingredients: one(ingredient, {
    fields: [home.ingredientId],
    references: [ingredient.id],
  }),
  user: one(users, {
    fields: [home.userId],
    references: [users.id],
  }),
}));

export const recipe = createTable("recipe", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  quantity: real("quantity").notNull(),
  unit: text("unit", { enum: units }).notNull(),
  instruction: text("instruction").notNull().default("instruction"),
  isPublic: boolean("isPublic").notNull().default(false),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const recipeRelations = relations(recipe, ({ many, one }) => ({
  groups: many(recipe_group),
  contained: many(recipe_recipe, { relationName: "container" }),
  recipe: many(recipe_recipe, { relationName: "recipe" }),
  user: one(users, {
    fields: [recipe.userId],
    references: [users.id],
  }),
}));

export const recipe_recipe = createTable("recipe_recipe", {
  id: uuid("id").primaryKey().defaultRandom(),
  quantity: real("quantity").notNull(),
  containerId: uuid("containerId")
    .notNull()
    .references(() => recipe.id, { onDelete: "cascade" }),
  recipeId: uuid("recipeId")
    .notNull()
    .references(() => recipe.id, { onDelete: "cascade" }),
});

export const recipe_recipeRelations = relations(recipe_recipe, ({ one }) => ({
  recipe: one(recipe, {
    fields: [recipe_recipe.recipeId],
    references: [recipe.id],
    relationName: "recipe",
  }),
  container: one(recipe, {
    fields: [recipe_recipe.containerId],
    references: [recipe.id],
    relationName: "container",
  }),
}));

export const recipe_group = createTable(
  "recipe_group",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    order: integer("order").notNull().default(0),
    recipeId: uuid("recipeId")
      .notNull()
      .references(() => recipe.id, { onDelete: "cascade" }),
  },
  (t) => ({ unq: unique().on(t.name, t.recipeId) }),
);

export const recipe_groupRelations = relations(
  recipe_group,
  ({ one, many }) => ({
    recipe: one(recipe, {
      fields: [recipe_group.recipeId],
      references: [recipe.id],
    }),
    ingredients: many(recipe_ingredient),
  }),
);

export const recipe_ingredient = createTable("recipe_ingredient", {
  id: uuid("id").primaryKey().defaultRandom(),
  quantity: real("quantity").notNull(),
  unit: text("unit", { enum: units }).notNull(),
  order: integer("order").notNull().default(0),
  groupId: uuid("groupId")
    .notNull()
    .references(() => recipe_group.id, { onDelete: "cascade" }),
  ingredientId: uuid("ingredientId")
    .notNull()
    .references(() => ingredient.id, { onDelete: "cascade" }),
});

export const recipe_ingredientRelations = relations(
  recipe_ingredient,
  ({ one }) => ({
    ingredient: one(ingredient, {
      fields: [recipe_ingredient.ingredientId],
      references: [ingredient.id],
    }),
    group: one(recipe_group, {
      fields: [recipe_ingredient.groupId],
      references: [recipe_group.id],
    }),
  }),
);

export const menu = createTable("menu", {
  id: uuid("id").primaryKey().defaultRandom(),
  quantity: real("quantity").notNull(),
  day: date("day"),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  recipeId: uuid("recipeId")
    .notNull()
    .references(() => recipe.id, { onDelete: "cascade" }),
});

export const menuRelations = relations(menu, ({ one, many }) => ({
  recipe: one(recipe, { fields: [menu.recipeId], references: [recipe.id] }),
  items: many(items),
  user: one(users, {
    fields: [menu.userId],
    references: [users.id],
  }),
}));

export const items = createTable("items", {
  id: uuid("id").primaryKey().defaultRandom(),
  quantity: real("quantity").notNull(),
  unit: text("unit", { enum: units }).notNull(),
  checked: boolean("checked").notNull().default(false),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  recipeIngredientId: uuid("recipeIngredientId").references(
    () => recipe_ingredient.id,
    {
      onDelete: "cascade",
    },
  ),
  ingredientId: uuid("ingredientId")
    .notNull()
    .references(() => ingredient.id),
  menuId: uuid("menuId").references(() => menu.id, { onDelete: "cascade" }),
});

export const itemsRelations = relations(items, ({ one, many }) => ({
  ingredient: one(ingredient, {
    fields: [items.ingredientId],
    references: [ingredient.id],
  }),
  recipe_ingredient: one(recipe_ingredient, {
    fields: [items.recipeIngredientId],
    references: [recipe_ingredient.id],
  }),
  menu: one(menu, {
    fields: [items.menuId],
    references: [menu.id],
  }),
  user: one(users, {
    fields: [items.userId],
    references: [users.id],
  }),
  comments: many(item_comment),
}));

export const item_comment = createTable("item_comment", {
  id: uuid("id").primaryKey().defaultRandom(),
  comment: text("comment").notNull(),
  itemId: uuid("itemId")
    .notNull()
    .references(() => items.id, { onDelete: "cascade" }),
});

export const item_commentRelations = relations(item_comment, ({ one }) => ({
  item: one(items, {
    fields: [item_comment.itemId],
    references: [items.id],
  }),
}));

export const store = createTable(
  "store",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    default: boolean("default").notNull().default(false),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").defaultNow(),
  },
  (t) => ({ slug_user: unique().on(t.userId, t.slug) }),
);

export const storeRelations = relations(store, ({ many, one }) => ({
  store_categories: many(store_category),
  user: one(users, {
    fields: [store.userId],
    references: [users.id],
  }),
}));

export const store_category = createTable("store_category", {
  id: uuid("id").primaryKey().defaultRandom(),
  order: integer("order").notNull(),
  storeId: uuid("storeId")
    .notNull()
    .references(() => store.id, { onDelete: "cascade" }),
  categoryId: integer("categoryId")
    .notNull()
    .references(() => category.id, {
      onDelete: "cascade",
    }),
});

export const store_categoryRelations = relations(
  store_category,
  ({ one, many }) => ({
    store: one(store, {
      fields: [store_category.storeId],
      references: [store.id],
    }),
    category: one(category, {
      fields: [store_category.categoryId],
      references: [category.id],
    }),
    store_subcategories: many(store_subcategory),
  }),
);

export const store_subcategory = createTable("store_subcategory", {
  id: uuid("id").primaryKey().defaultRandom(),
  order: integer("order").notNull(),
  store_categoryId: uuid("store_categoryId")
    .notNull()
    .references(() => store_category.id, { onDelete: "cascade" }),
  subcategoryId: integer("subcategoryId")
    .notNull()
    .references(() => subcategory.id, { onDelete: "cascade" }),
});

export const store_subcategoryRelations = relations(
  store_subcategory,
  ({ one }) => ({
    store: one(store_category, {
      fields: [store_subcategory.store_categoryId],
      references: [store_category.id],
    }),
    subcategory: one(subcategory, {
      fields: [store_subcategory.subcategoryId],
      references: [subcategory.id],
    }),
  }),
);

export const methodEnum = pgEnum("method", ["create", "update", "delete"]);
export const auditLog = createTable("audit_log", {
  id: serial("id").primaryKey(),
  method: methodEnum("method").notNull(),
  action: text("action").notNull(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  data: json("data").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const auditLogRelations = relations(auditLog, ({ one }) => ({
  user: one(users, {
    fields: [auditLog.userId],
    references: [users.id],
  }),
}));
