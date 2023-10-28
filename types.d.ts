export type CategoryItem = {
  name: string;
  id: number;
  subcategories: { name: string; id: number }[];
};
