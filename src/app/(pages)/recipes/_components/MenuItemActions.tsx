"use client";
import { useState } from "react";
import { toast } from "sonner";
import Icon from "~/components/common/Icon";
import { Button } from "~/components/ui/button";
import { Spinner } from "~/components/ui/spinner";
import { copyLinkToRecipe } from "~/lib/utils";
import { addToMenu } from "~/server/api/menu";

type Props = { id: string; name: string; shared: boolean; isPublic: boolean };

const MenuItemActions = ({ id, name, shared, isPublic }: Props) => {
  const [loading, setLoading] = useState(false);
  const onAddToMenu = async () => {
    setLoading(true);
    try {
      await addToMenu({ id });
      toast.success(`Lade ${name} till menyn.`);
    } catch {
      toast.error("Något gick fel...");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex w-full justify-end">
      {isPublic && (
        <Button
          variant="outline"
          className="h-8"
          onClick={() => copyLinkToRecipe(id)}
        >
          <Icon className="cursor-default" icon="HandHelping" />
        </Button>
      )}
      {!shared && (
        <Button className="h-8" variant="outline" onClick={onAddToMenu}>
          {loading ? <Spinner /> : <Icon icon="Plus" />}
          <span>Meny</span>
        </Button>
      )}
    </div>
  );
};

export default MenuItemActions;
