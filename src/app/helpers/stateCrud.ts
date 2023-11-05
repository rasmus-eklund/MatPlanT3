import { Dispatch, SetStateAction } from "react";

const crudFactory = <T extends { id: string }>(
  fn: Dispatch<SetStateAction<T[]>>,
) => {
  const add = (item: T) => {
    fn((p) => [...p, item]);
  };
  const remove = ({ id }: { id: string }) => {
    fn((p) => p.filter((i) => i.id !== id));
  };
  const update = (item: T) => {
    fn((p) => {
      const index = p.findIndex((i) => i.id === item.id);
      const newItems = [...p];
      if (index !== -1) {
        newItems[index] = item;
      }
      return newItems;
    });
  };
  return { add, remove, update };
};

export default crudFactory;
