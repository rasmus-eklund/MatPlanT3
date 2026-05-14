"use client";
import { useState } from "react";
import { toast } from "sonner";
import Icon from "~/components/common/Icon";
import { Button } from "~/components/ui/button";
import { Spinner } from "~/components/ui/spinner";
import { addToMenu } from "~/server/api/menu";

type Props = { id: string; name: string };

const AddToMenu = ({ id, name }: Props) => {
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
    <Button variant="outline" onClick={onAddToMenu}>
      {loading ? <Spinner /> : <Icon icon="Plus" />}
      <span>Meny</span>
    </Button>
  );
};

export default AddToMenu;
