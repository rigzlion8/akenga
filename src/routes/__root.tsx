import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { type ReactNode, useState, useEffect } from "react";
import { Menu, LogOut, Loader2, ShoppingBag } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CartProvider, useCart } from "@/hooks/cart";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Akenga Arts Centre" },
      { name: "description", content: "A living archive where African creativity is exhibited, taught, and celebrated. Nairobi, Kenya." },
      { name: "author", content: "Akenga Arts Centre" },
      { property: "og:title", content: "Akenga Arts Centre" },
      { property: "og:description", content: "Where Art Breathes, Roots | Love | Culture" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/favicon.svg",
      },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Inter:wght@300;400;500;600&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const routerState = useRouterState();
  const isNavigating = routerState.isLoading || routerState.isTransitioning;

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        {isNavigating && (
          <div className="fixed top-0 left-0 right-0 z-[60] h-1 bg-accent/30">
            <div className="h-full bg-accent animate-[loader_1s_ease-in-out_infinite] rounded-full" />
          </div>
        )}
        <style>{`@keyframes loader{0%{width:0;margin-left:0}50%{width:70%;margin-left:15%}100%{width:0;margin-left:100%}}`}</style>
        <Toaster />
        <SiteHeader />
        <main className={`min-h-screen transition-opacity duration-150 ${isNavigating ? "opacity-60" : "opacity-100"}`}>
          <Outlet />
        </main>
        <SiteFooter />
      </CartProvider>
    </QueryClientProvider>
  );
}

function SiteHeader() {
  const linkClass = "text-xs tracking-[0.25em] uppercase text-foreground/80 hover:text-accent transition-colors";
  const activeClass = "text-accent border-b border-accent pb-1";
  const mobileLinkClass = "block py-3 px-4 text-sm tracking-[0.2em] uppercase text-foreground/80 hover:text-accent hover:bg-muted/50 transition-colors rounded-md";
  const mobileActiveClass = "text-accent bg-muted/50";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem("auth_token"));
  }, []);

  const { itemCount } = useCart();

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setLoggedIn(false);
    setMobileOpen(false);
    window.location.href = "/";
  };

  const navLinks = [
    { to: "/" as const, label: "Home", exact: true },
    { to: "/studio" as const, label: "Studio" },
    { to: "/artists" as const, label: "Artists" },
    { to: "/classes" as const, label: "Classes" },
    { to: "/shop" as const, label: "Shop" },
  ];

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-background/85 backdrop-blur-md border-b border-border/60">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <span className="w-10 h-10 rounded-full border border-accent flex items-center justify-center font-serif text-accent text-lg">A</span>
          <span className="leading-tight">
            <span className="block font-serif text-xl tracking-wider">AKENGA</span>
            <span className="block text-[0.6rem] tracking-[0.3em] text-muted-foreground">ARTS CENTRE</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={linkClass}
              activeOptions={l.exact ? { exact: true } : undefined}
              activeProps={{ className: activeClass }}
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/cart"
            className={`${linkClass} relative flex items-center gap-1`}
            activeProps={{ className: activeClass }}
          >
            <ShoppingBag className="h-4 w-4" />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-4 bg-accent text-accent-foreground text-[0.6rem] w-4 h-4 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
          {loggedIn && (
            <Link to="/admin" className={linkClass} activeProps={{ className: activeClass }}>
              Admin
            </Link>
          )}
        </nav>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger className="md:hidden p-2 -mr-2 rounded-md text-foreground/70 hover:text-accent hover:bg-muted/50 transition-colors cursor-pointer">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Open menu</span>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] px-0 pt-16">
            <nav className="flex flex-col gap-1 px-4">
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className={mobileLinkClass}
                  activeOptions={l.exact ? { exact: true } : undefined}
                  activeProps={{ className: mobileActiveClass }}
                  onClick={() => setMobileOpen(false)}
                >
                  {l.label}
                </Link>
              ))}
              <Link
                to="/cart"
                className={`${mobileLinkClass} flex items-center gap-2`}
                onClick={() => setMobileOpen(false)}
              >
                <ShoppingBag className="h-4 w-4" />
                Cart
                {itemCount > 0 && (
                  <span className="ml-auto bg-accent text-accent-foreground text-[0.65rem] px-2 py-0.5 rounded-full">
                    {itemCount}
                  </span>
                )}
              </Link>
              {loggedIn && (
                <>
                  <div className="my-2 border-t border-border/60" />
                  <Link
                    to="/admin"
                    className={mobileLinkClass}
                    onClick={() => setMobileOpen(false)}
                  >
                    Admin Panel
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 py-3 px-4 text-sm tracking-[0.2em] uppercase text-muted-foreground hover:text-destructive hover:bg-muted/50 transition-colors rounded-md cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="mt-24 bg-[oklch(0.13_0.04_262)] text-[oklch(0.92_0.01_265)]">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20 grid sm:grid-cols-2 lg:grid-cols-3 gap-12">
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="flex items-start gap-3">
            <span className="w-12 h-12 rounded-full border-2 border-accent flex items-center justify-center font-serif text-accent text-xl shrink-0">A</span>
            <div>
              <p className="font-serif text-2xl tracking-wider">Akenga</p>
              <p className="text-[0.6rem] tracking-[0.35em] uppercase text-accent mt-0.5">Arts Centre</p>
            </div>
          </div>
          <p className="mt-6 text-sm leading-relaxed text-[oklch(0.65_0.03_250)] max-w-xs">
            A sanctuary for contemporary African art, music education, and curated artisanal goods.
          </p>
        </div>

        <div>
          <p className="text-[0.65rem] tracking-[0.3em] uppercase text-accent mb-4">Visit</p>
          <div className="space-y-2 text-sm text-[oklch(0.78_0.02_260)]">
            <p>Devson Court, Argwings Kodhek Close</p>
            <p>Hurlingham, Nairobi</p>
          </div>
        </div>

        <div>
          <p className="text-[0.65rem] tracking-[0.3em] uppercase text-accent mb-4">Contact</p>
          <div className="space-y-2 text-sm text-[oklch(0.78_0.02_260)]">
            <p>
              <a href="tel:+254757687103" className="hover:text-accent transition-colors">+254 757 687 103</a>
            </p>
            <p>
              <a href="mailto:hello@akengaarts.com" className="hover:text-accent transition-colors">hello@akengaarts.com</a>
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-[oklch(0.25_0.05_260)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs tracking-[0.15em] uppercase text-[oklch(0.55_0.03_255)]">
          <p>© {new Date().getFullYear()} Akenga Arts Centre</p>
          <p>
            Powered by{" "}
            <a
              href="https://maishatech.co.ke"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-[oklch(0.9_0.01_265)] transition-colors"
            >
              MaishaTech
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
