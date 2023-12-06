const About = () => {
  return (
    <div className="flex h-full w-full flex-col items-center gap-8 px-2 py-10">
      <h1 className="text-4xl text-c1">Stöd MatPlan</h1>
      <ul className="flex flex-col gap-2 text-sm text-c3">
        <li>
          <a
            className="underline"
            href="https://patreon.com/RasmusEklund?utm_medium=clipboard_copy&utm_source=copyLink&utm_campaign=creatorshare_creator&utm_content=join_link"
          >
            Patreon
          </a>
        </li>
        <li>
          <a
            className="underline"
            href="https://www.buymeacoffee.com/RasmusEklund"
          >
            Buy me a coffee
          </a>
        </li>
        <li>
          <p>Swish: +46730369128</p>
        </li>
        <li>
          <p>BTC: 33raDe1eJpozchbQTDXr3JaCtWMzkMEcqh</p>
        </li>
        <li>
          <p>ETH: 0x1AaCeE6107dd2bBC8E51d64471460B8e890B2Ae0</p>
        </li>
      </ul>
    </div>
  );
};

export default About;
