import { WHATSAPP_URL } from "./WhatsAppButton";

const COMPANY_LINKS = [
  { label: "Services", href: "/#services" },
  { label: "Work", href: "/#work" },
  { label: "Process", href: "/#process" },
  { label: "FAQ", href: "/#faq" },
  { label: "Jobs", href: "/jobs/" },
  { label: "Projects", href: "/projects/" },
];

export function SiteFooter() {
  return (
    <footer className="group/footer relative overflow-hidden border-t border-border/60 bg-background">
      {/* Subtle decorative glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-10 h-64 w-64 rounded-full bg-primary/5 blur-3xl transition-transform duration-1000 ease-out group-hover/footer:translate-x-8"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 bottom-0 h-64 w-64 rounded-full bg-accent/5 blur-3xl transition-transform duration-1000 ease-out group-hover/footer:-translate-x-8"
      />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div className="sm:col-span-2">
          <a
            href="/"
            className="group inline-flex items-center gap-2.5 rounded-lg transition-transform duration-300 ease-out hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground shadow-subtle transition-all duration-300 ease-out group-hover:scale-105 group-hover:-rotate-3 group-hover:shadow-elevated">
              V
            </span>

            <span className="font-display text-lg font-semibold tracking-[-0.04em] transition-colors duration-300 group-hover:text-primary">
              VyntrixNova
            </span>
          </a>

          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground transition-colors duration-300 hover:text-foreground-secondary">
            A product studio building web, mobile and AI systems for teams that need the work to
            actually ship.
          </p>
        </div>

        {/* Company */}
        <div>
          <h3 className="text-sm font-semibold transition-colors duration-300 hover:text-primary">
            Company
          </h3>

          <ul className="mt-4 space-y-2.5 text-sm">
            {COMPANY_LINKS.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className="group/link relative inline-flex items-center text-muted-foreground transition-all duration-300 ease-out hover:translate-x-1 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <span>{item.label}</span>

                  <span
                    aria-hidden="true"
                    className="ml-1.5 max-w-0 overflow-hidden opacity-0 transition-all duration-300 ease-out group-hover/link:max-w-4 group-hover/link:translate-x-0.5 group-hover/link:opacity-100"
                  >
                    →
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-sm font-semibold transition-colors duration-300 hover:text-primary">
            Get in touch
          </h3>

          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            <li className="transition-colors duration-300 hover:text-foreground">
              vyntrix.n0va.tech@gmail.com
            </li>

            <li className="transition-colors duration-300 hover:text-foreground">
              Peshawar, Pakistan
            </li>

            <li className="transition-colors duration-300 hover:text-foreground">
              Remote worldwide
            </li>

            <li>
              <a
                className="group/whatsapp inline-flex items-center gap-1.5 rounded-md text-accent transition-all duration-300 ease-out hover:translate-x-1 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                href={WHATSAPP_URL}
              >
                <span>WhatsApp us</span>

                <span
                  aria-hidden="true"
                  className="transition-transform duration-300 ease-out group-hover/whatsapp:translate-x-1"
                >
                  ↗
                </span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative border-t border-border/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-6 text-xs text-muted-foreground">
          <span className="transition-colors duration-300 hover:text-foreground">
            &copy; {new Date().getFullYear()} VyntrixNova. All rights reserved.
          </span>

          <span aria-hidden="true" className="hidden h-px flex-1 bg-border/60 sm:block" />

          <span className="hidden transition-colors duration-300 hover:text-foreground sm:block">
            Built to ship.
          </span>
        </div>
      </div>
    </footer>
  );
}
