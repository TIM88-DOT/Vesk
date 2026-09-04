import { useState, useEffect } from "react";

const navLinks = [
  "Features",
  "Integrations",
  "Responsible AI",
  "Pricing",
] as const;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-white/70 backdrop-blur-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border-b border-black/[0.04]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-6 md:px-8 h-[64px] flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center shadow-[0_0_0_1px_rgba(0,0,0,0.04)]">
              <span className="text-[11px] font-bold text-[#0d0d0d] leading-none">V</span>
            </div>
            <span className="text-[17px] font-semibold text-[#0d0d0d] tracking-[-0.4px]">
              Vesk
            </span>
          </a>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((label) => (
              <a
                key={label}
                href={`#${label.toLowerCase().replace(/\s+/g, "-")}`}
                className="px-4 py-2 text-[14px] text-[#666666] hover:text-[#0d0d0d] rounded-lg hover:bg-black/[0.03] transition-all duration-200"
              >
                {label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="/login"
              className="px-4 py-2 text-[14px] text-[#666666] hover:text-[#0d0d0d] transition-colors"
            >
              Log in
            </a>
            <a
              href="/register"
              className="px-5 py-2 text-[14px] font-medium text-white bg-[#0d0d0d] rounded-lg hover:bg-[#1a1a1a] transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
            >
              Get Started
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-black/[0.03] transition-colors"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            <div className="w-[18px] flex flex-col gap-[5px]">
              <span
                className={`block h-[1.5px] bg-[#0d0d0d] rounded-full transition-all duration-300 origin-center ${
                  mobileOpen ? "rotate-45 translate-y-[6.5px]" : ""
                }`}
              />
              <span
                className={`block h-[1.5px] bg-[#0d0d0d] rounded-full transition-all duration-300 ${
                  mobileOpen ? "opacity-0 scale-x-0" : ""
                }`}
              />
              <span
                className={`block h-[1.5px] bg-[#0d0d0d] rounded-full transition-all duration-300 origin-center ${
                  mobileOpen ? "-rotate-45 -translate-y-[6.5px]" : ""
                }`}
              />
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile overlay menu */}
      <div
        className={`fixed inset-0 z-40 bg-white transition-all duration-500 md:hidden ${
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col justify-between h-full pt-24 pb-10 px-8">
          <div className="space-y-1">
            {navLinks.map((label, i) => (
              <a
                key={label}
                href={`#${label.toLowerCase().replace(/\s+/g, "-")}`}
                className="block text-[28px] font-semibold text-[#0d0d0d] py-3 transition-all duration-500"
                style={{
                  letterSpacing: "-0.5px",
                  opacity: mobileOpen ? 1 : 0,
                  transform: mobileOpen ? "translateY(0)" : "translateY(16px)",
                  transitionDelay: `${100 + i * 60}ms`,
                }}
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </a>
            ))}
          </div>

          <div
            className="space-y-4 transition-all duration-500"
            style={{
              opacity: mobileOpen ? 1 : 0,
              transform: mobileOpen ? "translateY(0)" : "translateY(16px)",
              transitionDelay: "300ms",
            }}
          >
            <a
              href="/register"
              className="block text-center py-3.5 text-[16px] font-medium text-white bg-[#0d0d0d] rounded-xl"
            >
              Get Started
            </a>
            <a
              href="/login"
              className="block text-center py-3.5 text-[16px] text-[#666666]"
            >
              Log in
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
