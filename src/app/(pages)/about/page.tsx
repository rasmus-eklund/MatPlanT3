import Link from "next/link";

const About = () => {
  return (
    <main className="flex h-full w-full flex-col items-center gap-8 px-2 py-10">
      <h1 className="text-4xl text-c1">MatPlan</h1>
      <Link href={"/privacy"}>Privacy policy</Link>
    </main>
  );
};

export default About;
