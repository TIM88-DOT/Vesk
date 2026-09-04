const links = {
  Product: ["Features", "Pricing", "Changelog"],
  Company: ["About", "Blog", "Contact"],
  Legal: ["Privacy", "Terms", "GDPR"],
} as const;

export default function Footer() {
  return (
    <footer
      id="contact"
      className="border-t border-[rgba(0,0,0,0.05)] py-14 px-6 md:px-8"
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-6 h-6 rounded-lg bg-brand flex items-center justify-center">
                <span className="text-[9px] font-bold text-[#0d0d0d] leading-none">
                  V
                </span>
              </div>
              <span
                className="text-[17px] text-[#0d0d0d] font-semibold"
                style={{ letterSpacing: "-0.4px" }}
              >
                Vesk
              </span>
            </div>
            <p className="text-[14px] text-[#aaaaaa] leading-[1.6] max-w-[260px]">
              AI-native communication for appointment-based businesses.
            </p>
          </div>

          {/* Link columns */}
          <div className="flex gap-16 flex-wrap">
            {Object.entries(links).map(([title, items]) => (
              <div key={title}>
                <p className="font-mono text-[10px] text-[#bbbbbb] tracking-[1px] uppercase mb-4 font-medium">
                  {title}
                </p>
                <ul className="space-y-2.5">
                  {items.map((item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="text-[14px] text-[#777777] hover:text-[#0d0d0d] transition-colors"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-[rgba(0,0,0,0.05)] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[13px] text-[#bbbbbb]">
            &copy; {new Date().getFullYear()} Vesk
          </p>
          <div className="flex gap-6">
            {["Twitter", "LinkedIn", "GitHub"].map((s) => (
              <a
                key={s}
                href="#"
                className="text-[13px] text-[#bbbbbb] hover:text-[#0d0d0d] transition-colors"
              >
                {s}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
