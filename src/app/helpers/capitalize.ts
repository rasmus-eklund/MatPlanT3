const capitalize = (s: string) =>
  s
    .split("")
    .map((l, i) => (i === 0 ? l.toUpperCase() : l))
    .join("");

export default capitalize;
