import Image from "next/image";
import { getServerAuthSession } from "../server/auth";
import LoginHome from "./_components/layout/LoginHome";
import { redirect } from "next/navigation";

const Home = async () => {
  const session = await getServerAuthSession();
  if (session) {
    redirect("/menu");
  }
  return (
    <div className="flex items-center justify-center p-10">
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
      <div className="z-10 flex flex-col items-center gap-5 rounded-3xl bg-c1/50 p-2 md:p-10">
        <h1 className="z-10 text-center text-2xl font-bold text-c5">
          Välkommen till MatPlan!
        </h1>
        <p className="text-center text-xl font-bold text-c5">
          Planera måltider, förenkla inköpslistor och effektivisera dina
          matinköp.
        </p>
        {!session && <LoginHome />}
      </div>
    </div>
  );
};

export default Home;
