import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import Image from "next/image";
import { Button } from "~/components/ui/button";

type Props = {
  name: string | null;
  email: string | null;
  image: string | null;
};
const UserProfile = async ({ image, name, email }: Props) => {
  return (
    <section className="flex items-center gap-5 self-center p-5">
      {image && (
        <Image
          className="w-16 rounded-full"
          alt="Profilbild"
          width={250}
          height={250}
          src={image}
        />
      )}
      <div className="flex flex-col gap-1 text-c1">
        <p className="text-xl">{name ?? "Inget namn"}</p>
        <p className="text-sm">{email ?? "Ingen email"}</p>
        <Button
          nativeButton={false}
          render={<LogoutLink className="text-c5">Logga ut</LogoutLink>}
          variant="outline"
        />
      </div>
    </section>
  );
};

export default UserProfile;
