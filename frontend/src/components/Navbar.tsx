import { LogoIcon } from "./LogoIcon";

const navLinks = ["How it Works", "Groups", "Reputation", "Docs", "FAQ"];

export function Navbar() {
  return (
    <nav className="absolute top-0 left-0 right-0 z-20 px-6 py-5">
      <div className="flex items-center justify-between max-w-[88rem] mx-auto">
        {/* Left: Logo */}
        <div className="flex items-center gap-2">
          <LogoIcon className="w-7 h-7 text-black" />
          <span
            className="text-2xl font-medium tracking-tight text-black"
            style={{ fontWeight: 500 }}
          >
            Vespera
          </span>
        </div>

        {/* Center: Nav links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link}
              href="#"
              className="text-base text-gray-700 hover:text-black font-medium transition-colors duration-200"
            >
              {link}
            </a>
          ))}
        </div>

        {/* Right: CTA */}
        <button className="bg-[#86EFAC] text-black text-base font-medium px-7 py-2.5 rounded-full hover:bg-[#4ADE80] transition-colors duration-200">
          Launch App
        </button>
      </div>
    </nav>
  );
}
