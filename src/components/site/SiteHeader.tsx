import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const NAV = [
  { label: "Services", to: "/services" },
  { label: "Work", to: "/work" },
  { label: "Projects", to: "/projects" },
  { label: "Pricing", to: "/pricing" },
  { label: "About", to: "/about" },
  { label: "Jobs", to: "/jobs" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link to="/" className="flex items-center gap-2.5">
          <img
            src="/vyntrix-logo.jpeg"
            alt="VyntrixNova"
            className="h-8 w-8 rounded-lg object-cover"
          />

          <span className="font-display text-lg font-semibold tracking-[-0.04em] text-foreground">
            VyntrixNova
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              activeProps={{
                className: "text-foreground font-medium",
              }}
              className="rounded-md px-2 py-1.5 text-sm font-medium tracking-[0.01em] text-foreground-secondary transition-[color,background-color,transform] duration-(--motion-standard) ease-(--ease-standard) hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <Link
            to="/contact"
            className="premium-button rounded-lg bg-primary px-4 py-2 text-sm font-medium tracking-[0.01em] text-primary-foreground shadow-subtle transition-[background-color,transform,box-shadow] duration-(--motion-standard) ease-(--ease-standard) hover:bg-primary-hover hover:shadow-elevated active:bg-primary-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Start a project
          </Link>
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="rounded-md p-2 transition-transform duration-200 hover:scale-105 md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div
          className="border-t border-border bg-background md:hidden"
          role="navigation"
          aria-label="Mobile navigation"
        >
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-4">
            {NAV.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2.5 text-sm text-foreground-secondary transition-[background-color,color,transform] duration-(--motion-standard) ease-(--ease-standard) hover:bg-surface-interactive hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {item.label}
              </Link>
            ))}

            <Link
              to="/contact"
              onClick={() => setOpen(false)}
              className="premium-button mt-2 rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-medium text-primary-foreground shadow-subtle transition-[background-color,transform,box-shadow] duration-(--motion-standard) ease-(--ease-standard) hover:bg-primary-hover hover:shadow-elevated active:bg-primary-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Start a project
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
