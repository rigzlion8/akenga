import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { type ReactNode } from "react";

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
      { property: "og:description", content: "Where Art Breathes, Music Resonates, and Culture Endures." },
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

  return (
    <QueryClientProvider client={queryClient}>
      <SiteHeader />
      <main className="min-h-screen">
        <Outlet />
      </main>
      <SiteFooter />
    </QueryClientProvider>
  );
}

function SiteHeader() {
  const linkClass = "text-xs tracking-[0.25em] uppercase text-foreground/80 hover:text-accent transition-colors";
  const activeClass = "text-accent border-b border-accent pb-1";
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-background/85 backdrop-blur-md border-b border-border/60">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-full border border-accent flex items-center justify-center font-serif text-accent text-lg">A</span>
          <span className="leading-tight">
            <span className="block font-serif text-xl tracking-wider">AKENGA</span>
            <span className="block text-[0.6rem] tracking-[0.3em] text-muted-foreground">ARTS CENTRE</span>
          </span>
        </Link>
        <nav className="flex items-center gap-8">
          <Link to="/" className={linkClass} activeOptions={{ exact: true }} activeProps={{ className: activeClass }}>Home</Link>
          <Link to="/studio" className={linkClass} activeProps={{ className: activeClass }}>Studio</Link>
          <Link to="/classes" className={linkClass} activeProps={{ className: activeClass }}>Classes</Link>
          <Link to="/shop" className={linkClass} activeProps={{ className: activeClass }}>Shop</Link>
        </nav>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-border/60 mt-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12 grid md:grid-cols-3 gap-8 text-sm text-muted-foreground">
        <div>
          <p className="font-serif text-2xl text-foreground">Akenga</p>
          <p className="mt-2 text-xs tracking-[0.2em] uppercase">Arts Centre · Nairobi</p>
        </div>
        <div>
          <p className="eyebrow">Visit</p>
          <p className="mt-3">The Atelier, Kilimani<br/>Nairobi, Kenya</p>
        </div>
        <div>
          <p className="eyebrow">Contact</p>
          <p className="mt-3">hello@akenga.art<br/>+254 700 000 000</p>
        </div>
      </div>
      <div className="border-t border-border/60 py-6 text-center text-xs tracking-[0.2em] uppercase text-muted-foreground">
        © {new Date().getFullYear()} Akenga Arts Centre
        <span className="mx-3 text-border">|</span>
        Powered by{" "}
        <a
          href="https://maishatech.co.ke"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:text-foreground transition-colors"
        >
          MaishaTech
        </a>
      </div>
    </footer>
  );
}
