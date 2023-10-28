import Image from "next/image";
import { getServerAuthSession } from "../server/auth";
import LoginHome from "./_components/layout/LoginHome";
import Link from "next/link";

const Home = async () => {
  const session = await getServerAuthSession();

  return (
    <div className="flex justify-center items-center h-full">
      <Image
        className="z-0 h-full w-full"
        src="/bgimage_sm.jpg"
        alt="background image"
        placeholder="blur"
        blurDataURL="/bgimage_sm.jpg"
        layout="fill"
        objectFit="cover"
        objectPosition="center"
      />
      <div className="bg-c1/50 z-10 flex flex-col items-center gap-5 rounded-3xl p-10">
        <h1 className="text-c5 z-10 text-center text-2xl font-bold">
          Välkommen till MatPlan!
        </h1>
        <p className="text-c5 text-center text-xl font-bold">
          Planera måltider, förenkla inköpslistor och effektivisera dina
          matinköp.
        </p>
        {session ? (
          <Link href={"/menu"}>Börja planera måltider!</Link>
        ) : (
          <LoginHome />
        )}
      </div>
    </div>
  );
};

export default Home;
