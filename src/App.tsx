import { useEffect, useState } from "react";
import PublicSite from "./components/PublicSite";
import Admin from "./components/Admin";

/* Roteamento por hash (#/admin) — funciona em hospedagem estática
   (Lovable, preview) sem precisar de fallback de SPA no servidor. */
function useHashRoute(): string {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return hash;
}

export default function App() {
  const hash = useHashRoute();
  if (hash.startsWith("#/admin")) return <Admin />;
  return <PublicSite />;
}
