const sortByName = <T extends { name: string }>(items: T[]) => {
  return items.sort((a, b) => {
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return 0;
  });
};

export default sortByName;
