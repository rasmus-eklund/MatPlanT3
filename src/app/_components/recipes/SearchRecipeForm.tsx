import { Filter, SearchParams } from "@/types";
import { FC, useState } from "react";

type SearchFormProps = {
  handleSearch: ({ search, filter }: SearchParams) => boolean;
  onlySearch: boolean;
};

const SearchRecipeForm: FC<SearchFormProps> = ({
  handleSearch,
  onlySearch = false,
}) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("name");

  const handleReset = (reset: boolean) => {
    if (reset) {
      setSearch("");
    }
  };

  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        handleReset(handleSearch({ filter, search }));
      }}
    >
      <div className="flex gap-2">
        <input
          className={`bg-c2 text-xl px-2 rounded-md h-10 ${
            onlySearch ? "w-full" : "w-2/3"
          }`}
          id="search"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={"Sök"}
        />
        {!onlySearch && (
          <select
            className="rounded-md bg-c2 text-xl h-10 px-2 w-1/3"
            name="filter"
            id="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value as Filter)}
          >
            <option value="name">Namn</option>
            <option value="ingredient">Ingrediens</option>
            <option value="instruction">Instruktion</option>
          </select>
        )}
      </div>
      {!onlySearch && (
        <button type="submit" className="bg-c2 rounded-md text-xl h-10 px-6">
          Sök
        </button>
      )}
    </form>
  );
};

export default SearchRecipeForm;
