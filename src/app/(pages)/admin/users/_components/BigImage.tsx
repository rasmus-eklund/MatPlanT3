"use client";
import { useState } from "react";
import Image from "next/image";
import { Button } from "~/components/ui/button";
import Icon from "~/components/common/Icon";

const BigImage = ({ image }: { image: string | null }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        className="p-0"
        onClick={() => image && setOpen(true)}
      >
        {image ? (
          <Image
            className="size-12"
            src={image}
            height={250}
            width={250}
            alt={"Profilbild"}
          />
        ) : (
          <div className="bg-c5 size-8"></div>
        )}
      </Button>
      {open && image && (
        <div className="bg-opacity-50 absolute top-0 left-0 flex h-full w-full items-center justify-center backdrop-blur-sm">
          <div className="relative flex size-60 items-center justify-center">
            <Button
              variant="outline"
              asChild
              className="absolute top-2 right-2 size-4"
              size="icon"
              onClick={() => setOpen(false)}
            >
              <Icon icon="X" className="text-c5" />
            </Button>
            <Image src={image} height={500} width={500} alt={"Profilbild"} />
          </div>
        </div>
      )}
    </>
  );
};

export default BigImage;
