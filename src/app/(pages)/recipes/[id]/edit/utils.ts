export const findArrayDifferences = <Item extends { id: string }>(
  A: Item[],
  B: Item[],
) => {
  const edited: Item[] = [];
  const added: Item[] = [];
  const removed: Item[] = [];
  const mapA = new Map(A.map((item) => [item.id, item]));

  for (const itemB of B) {
    if (mapA.has(itemB.id)) {
      const itemA = mapA.get(itemB.id)!;
      if (!isEqual(itemA, itemB)) {
        edited.push(itemB);
      }
      mapA.delete(itemB.id);
    } else {
      added.push(itemB);
    }
  }

  for (const itemA of mapA.values()) {
    removed.push(itemA);
  }

  return { edited, added, removed };
};

const isEqual = <T extends { id: string }>(a: T, b: T) => {
  for (const key of Object.keys(a)) {
    if (key !== "id" && a[key as keyof T] !== b[key as keyof T]) {
      return false;
    }
  }
  return true;
};
