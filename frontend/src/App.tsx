import {
  HashRouter as BrowserRouter,
  Routes,
  Route,
  Link,
  NavLink,
} from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";

interface NavLinkItem {
  label: string;
  baseLink: string;
  subLinks: { key: string; link: string }[] | null;
}

const NAV_LINKS: NavLinkItem[] = [
  {
    label: "Labor Markets",
    baseLink: "/labor-markets",
    subLinks: [
      {
        key: "Unemployment & Underemployment",
        link: "/unemployment-underemployment",
      },
      { key: "Wage Growth", link: "/wage-growth" },
      {
        key: "Number of Workers in Exposed Industries",
        link: "/workers-exposed-industries",
      },
      {
        key: "Number of Job Listings in Exposed Industries",
        link: "/job-listings-exposed-industries",
      },
    ],
  },
  {
    label: "Productivity",
    baseLink: "/productivity",
    subLinks: [
      { key: "TFP Growth", link: "/tfp-growth" },
      { key: "Adoption Data", link: "/adoption-data" },
      { key: "Software Dev Productivity", link: "/software-dev-productivity" },
      { key: "Corporate Financials", link: "/corporate-financials" },
    ],
  },
  { label: "About", baseLink: "/about", subLinks: null },
];

function Navbar() {
  return (
    <header>
      <nav style={{ backgroundColor: "#1d3557" }} className="text-white">
        <div className="mx-auto max-w-7xl px-6 py-2 flex items-center justify-between gap-10">
          <Link to="/" className="text-xl font-semibold leading-tight shrink-0">
            AI Economic Impact Tracker
          </Link>

          <ul className="hidden md:flex items-center gap-8 text-base">
            {NAV_LINKS.map(({ label, baseLink, subLinks }) => (
              <li key={baseLink}>
                {subLinks === null ? (
                  <NavLink
                    to={baseLink}
                    className={({ isActive }) =>
                      isActive
                        ? "text-white text-md"
                        : "text-white/70 hover:text-white transition-colors text-md"
                    }
                  >
                    {label}
                  </NavLink>
                ) : (
                  <div className="relative group">
                    <span className="text-white/70 group-hover:text-white transition-colors cursor-default text-md select-none">
                      {label}
                    </span>
                    <ul className="hidden group-hover:block absolute left-0 top-full w-48 rounded-md bg-white shadow-lg py-1 z-50">
                      {subLinks.map(({ key, link }) => (
                        <li key={key} className="px-1">
                          <NavLink
                            to={`${baseLink}${link}`}
                            className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                          >
                            {key}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 mx-auto w-full max-w-7xl px-6 py-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
