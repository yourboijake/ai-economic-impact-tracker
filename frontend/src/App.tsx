import { BrowserRouter, Routes, Route, Link, NavLink } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";

const NAV_LINKS = [
  { label: "Labor Markets", to: "/labor-markets" },
  { label: "Productivity", to: "/productivity" },
  { label: "About", to: "/about" },
];

function Navbar() {
  return (
    <header>
      <nav style={{ backgroundColor: "#1d3557" }} className="text-white">
        <div className="mx-auto max-w-7xl px-6 py-4 flex justify-between gap-10">
          <Link to="/" className="text-xl font-semibold leading-tight shrink-0">
            AI Economic Impact Tracker
          </Link>

          <ul className="hidden md:flex items-center gap-8 text-base">
            {NAV_LINKS.map(({ label, to }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    isActive ? "text-white" : "text-white/70 hover:text-white transition-colors"
                  }
                >
                  {label}
                </NavLink>
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
