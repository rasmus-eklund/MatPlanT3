import FoundRecipesLoading, {
  SearchRecipeLoading,
} from "./_components/FoundRecipesLoading";

const Loading = () => {
  return (
    <div className="flex h-full min-h-0 flex-col gap-2 pt-2">
      <SearchRecipeLoading />
      <FoundRecipesLoading />
    </div>
  );
};

export default Loading;
