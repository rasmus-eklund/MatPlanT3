"use client";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

const BackButton = () => {
  const router = useRouter();
  return (
    <Button variant="secondary" onClick={() => router.back()}>
      Tillbaka
    </Button>
  );
};

export default BackButton;
