"use client";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

const BackButton = ({ className }: { className?: string }) => {
  const router = useRouter();
  return (
    <Button
      className={className}
      variant="secondary"
      onClick={() => router.back()}
    >
      Tillbaka
    </Button>
  );
};

export default BackButton;
