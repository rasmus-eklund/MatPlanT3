import React from "react";

export default function HomePage() {
  return (
    <div className="flex h-dvh flex-col gap-6 p-4 md:p-10">
      <Section heading="MatPlan">
        <p>
          MatPlan är en mångsidig receptapp som går utöver traditionell
          recepthantering. Den låter dig planera dina måltider för veckan, skapa
          inköpslistor och optimera din matshopping. Oavsett om du är en
          matentusiast eller bara vill förenkla din matplanering, så har MatPlan
          allt du behöver!
        </p>
      </Section>

      <Section heading="Avdelningar">
        <Subsection heading="Meny">
          <p>
            Här sker din veckoplanering av måltider. Organisera enkelt din
            veckomeny genom att lägga till måltider för specifika dagar och
            justera portioner efter dina behov. Öppna ett recept för att bocka
            av ingredienser och instruktioner medan du lagar mat.
          </p>
        </Subsection>

        <Subsection heading="Maträtter">
          <p>
            Här hittar du alla dina recept. Sök efter recept med namn eller
            ingredienser och lägg till dem i din meny. Appen lägger automatiskt
            till de nödvändiga ingredienserna i din inköpslista. Du kan även
            kopiera delade recept från andra användare.
          </p>
        </Subsection>

        <Subsection heading="Inköpslista">
          <p>
            Här bockar du av dina varor medan du handlar. Ordningen på varorna
            följer butiks­layouten du ställt in. Lägg till extra varor som inte
            ingår i recept och markera de du redan har hemma.
          </p>
        </Subsection>

        <Subsection heading="Butiker">
          <p>
            Hantera dina favoritbutiker och anpassa layouten efter din
            shoppingrunda. Appen sorterar din inköpslista efter den ordning du
            föredrar, vilket gör shoppingen snabbare och smidigare.
          </p>
        </Subsection>
      </Section>

      <Section heading="Användning">
        <ol className="list-decimal pl-6">
          <li>Lägg till nya recept eller kopiera delade recept.</li>
          <li>Planera din meny och justera portioner vid behov.</li>
          <li>Anpassa din butikslayout.</li>
          <li>
            Lägg till extra varor i inköpslistan och markera de du redan har
            hemma.
          </li>
          <li>Bocka av varorna medan du handlar.</li>
          <li>Njut av enkel matplanering och shopping!</li>
        </ol>
      </Section>

      <Section heading="Inloggning">
        <p>
          För att få tillgång till alla funktioner, logga in på MatPlan med ditt
          Google-konto. När du är inloggad kan du spara dina inställningar och
          få tillgång till dina recept och inköpslistor var du än är.
        </p>
      </Section>

      <Section heading="Credits">
        <p>
          MatPlan är en förbättrad version av projektet RecipeJar, skapat av
          Allan Heremi, Rasmus Eklund och Jou-Fang Wang under en åtta dagar lång
          programmeringssprint. Rasmus Eklund fortsatte utvecklingen till vad
          appen är idag.
        </p>
      </Section>
    </div>
  );
}

const Section = ({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) => {
  return (
    <section
      className="flex flex-col gap-2"
      id={heading.toLowerCase().replaceAll(" ", "-")}
    >
      <h2 className="text-c2 px-2 text-2xl font-semibold">{heading}</h2>
      <div className="p-2 flex flex-col gap-4">{children}</div>
    </section>
  );
};

const Subsection = ({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-c3 text-lg font-medium">{heading}</h3>
      <div className="text-black">{children}</div>
    </div>
  );
};
