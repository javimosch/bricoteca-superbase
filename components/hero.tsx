import NextLogo from "./next-logo";
import SupabaseLogo from "./supabase-logo";

export default function Header() {
  return (
    <div className="flex flex-col gap-16 items-center">
      
      <h1 className="sr-only">Plateforme Bricothèque Massif de Bauges</h1>
      <p className="text-3xl lg:text-4xl !leading-tight mx-auto max-w-xl text-center">
        La plateforme de partage d'outils pour les{" "}
        <span className="font-bold">résidents du Massif de Bauges</span>{" "}
        est alimentée par{" "}
        <a
          href="https://enbauges.fr"
          target="_blank"
          className="font-bold hover:underline"
          rel="noreferrer"
        >
          enbauges.fr
        </a>{" "}
        </p>
      <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-8" />
     
    </div>
  );
}
