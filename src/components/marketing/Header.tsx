"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "#lieu", label: "Le Lieu" },
  { href: "#menu", label: "Menu" },
  { href: "/reserver", label: "Réserver" },
  { href: "/commander", label: "Click & Collect" },
  { href: "#contact", label: "Contact" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-marine/95 backdrop-blur-sm shadow-lg py-3"
            : "bg-transparent py-5"
        )}
      >
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <Link href="/" aria-label="Accueil — La Dégust' du Grand Coin">
            <Logo variant="beurre" size="sm" />
          </Link>

          {/* Desktop nav */}
          <nav
            className="hidden md:flex items-center gap-7"
            aria-label="Navigation principale"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sable/85 hover:text-beurre text-sm font-medium tracking-wide transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <Link
            href="/reserver"
            className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 bg-beurre text-encre text-sm font-semibold rounded-lg hover:bg-beurre/90 hover:scale-105 transition-all duration-200"
          >
            Réserver
          </Link>

          {/* Mobile burger */}
          <button
            className="md:hidden p-2 text-sable hover:text-beurre transition-colors"
            onClick={() => setMobileOpen(true)}
            aria-label="Ouvrir le menu de navigation"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Mobile sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          id="mobile-nav"
          side="right"
          showCloseButton={false}
          className="bg-marine border-marine/30 w-72 pt-0"
        >
          <div className="flex items-center justify-between p-5 border-b border-white/10">
            <Logo variant="beurre" size="sm" />
            <button
              onClick={() => setMobileOpen(false)}
              className="p-2 text-sable/70 hover:text-beurre transition-colors"
              aria-label="Fermer le menu"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex flex-col px-5 py-6 gap-1" aria-label="Navigation mobile">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-sable hover:text-beurre text-base font-medium py-3 border-b border-white/10 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/reserver"
              onClick={() => setMobileOpen(false)}
              className="mt-6 inline-flex items-center justify-center px-4 py-3 bg-beurre text-encre font-semibold rounded-lg hover:bg-beurre/90 transition-colors"
            >
              Réserver une table
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
