const partners = [
  { name: "Celo Foundation", style: { fontFamily: "'Times New Roman',serif", fontWeight: 400, letterSpacing: "0.02em", fontSize: "14px" } },
  { name: "MENTO", style: { fontFamily: "'Arial Black',sans-serif", fontWeight: 900, letterSpacing: "0.08em", fontSize: "16px" } },
  { name: "Valora", style: { fontFamily: "Impact,sans-serif", fontWeight: 700, letterSpacing: "0.05em", fontSize: "18px" } },
  { name: "Ubeswap", style: { fontFamily: "Georgia,serif", fontWeight: 600, letterSpacing: "-0.02em", fontSize: "17px" } },
  { name: "GoodDollar", style: { fontFamily: "Helvetica,sans-serif", fontWeight: 700, letterSpacing: "-0.01em", fontSize: "15px" } },
  { name: "IMPACTMARKET", style: { fontFamily: "Verdana,sans-serif", fontWeight: 700, letterSpacing: "0.06em", fontSize: "13px" } },
  { name: "Masa", style: { fontFamily: "'Courier New',monospace", fontWeight: 700, letterSpacing: "0.18em", fontSize: "14px" } },
  { name: "SocialConnect", style: { fontFamily: "'Palatino',serif", fontWeight: 500, letterSpacing: "0.03em", fontSize: "15px" } },
];

export function BackedBySection() {
  return (
    <section className="bg-[#F5F5F5] px-6 py-12">
      <div className="max-w-[88rem] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 items-center">
        <p className="text-black/70 text-base leading-relaxed">Built within the<br />Celo ecosystem.</p>
        <div className="md:col-span-3 overflow-hidden">
          <div className="backers-track">
            {[...partners, ...partners].map((p, i) => (
              <span key={i} className="mx-10 shrink-0 text-black/50 whitespace-nowrap" style={p.style}>{p.name}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
