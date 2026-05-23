import FoundRecipesLoading, {
  SearchRecipeLoading,
} from "./_components/FoundRecipesLoading";

const Loading = () => {
  return (
    <div className="flex flex-col gap-2 p-2">
      <SearchRecipeLoading />
      <FoundRecipesLoading />
    </div>
  );
};

export default Loading;
