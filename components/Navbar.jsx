import Image from "next/image";
import { getFilterFacets } from "@/lib/tournaments";
import NavMenu from "@/components/NavMenu";

export default async function Navbar() {
  const { sports, cities } = await getFilterFacets();

  return (
    <header className="nav">
      <div className="container nav-inner">
        <a href="/" className="brand" aria-label="TournamentWala home">
          <Image
            className="brand-mark"
            src="/images/logo.png"
            alt="TournamentWala logo"
            width={52}
            height={52}
            priority
          />
          <span className="brand-word">
            tournament<em>wala</em>
            <small>FIND · PLAY · WIN</small>
          </span>
        </a>

        <NavMenu sports={sports} cities={cities} />
      </div>
    </header>
  );
}
