import { ReactNode, useState } from "react";
import Icon from "~/icons/Icon";

const options = ["recept", "a-ö", "ö-a", "hemma"] as const;
type Option = (typeof options)[number];
type Filter = {
  sort: Option;
  search: string;
  home: boolean;
};
type Props = { children: ({ filter }: { filter: Filter }) => ReactNode };

const FilterItems = ({ children }: Props) => {
  const [filter, setFilter] = useState<Filter>({
    sort: "recept",
    search: "",
    home: true,
  });

  return (
    <div className="flex flex-col gap-2 rounded-md bg-c3 p-3">
      <div className="flex justify-between">
        <h2 className="text-c5">Recept varor:</h2>
        <div className="group relative">
          <Icon icon="filter" className="ml-2 h-8 fill-c5" />
          <form className="absolute right-full top-0 hidden flex-col gap-2 rounded-md bg-c4 p-2 group-hover:flex">
            <input
              type="text"
              className="px-1"
              value={filter.search}
              placeholder="Sök vara..."
              onChange={({ target: { value } }) =>
                setFilter((p) => ({ ...p, search: value }))
              }
            />
            <div className="flex gap-1">
              <label htmlFor="sort">Sortera</label>
              <select
                id="sort"
                value={filter.sort}
                onChange={({ target: { value } }) =>
                  setFilter((p) => ({ ...p, sort: value as Option }))
                }
              >
                {options.map((op) => (
                  <option key={op} value={op}>
                    {op}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-1">
              <label htmlFor="showHome">Visa Hemma</label>
              <input
                type="checkbox"
                id="showHome"
                checked={filter.home}
                onChange={() => setFilter((p) => ({ ...p, home: !p.home }))}
              />
            </div>
          </form>
        </div>
      </div>
      {children({ filter })}
    </div>
  );
};

export default FilterItems;
