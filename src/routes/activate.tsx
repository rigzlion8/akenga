import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { activateAccount } from "@/lib/api";

export const Route = createFileRoute("/activate")({
  head: () => ({ meta: [{ title: "Activate — Akenga Arts Centre" }] }),
  component: Activate,
});

function Activate() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (!token) {
      setStatus("error");
      setMessage("No activation token found.");
      return;
    }
    activateAccount({ data: { token } })
      .then((result) => {
        localStorage.setItem("auth_token", result.token);
        localStorage.setItem("auth_user", JSON.stringify(result.user));
        setStatus("success");
      })
      .catch((e) => {
        setStatus("error");
        setMessage(e.message || "Activation failed.");
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 pt-24 pb-12">
      <div className="max-w-sm text-center">
        {status === "loading" && (
          <>
            <Loader2 className="h-12 w-12 mx-auto text-accent animate-spin" />
            <h1 className="font-serif text-2xl mt-4">Activating...</h1>
            <p className="text-muted-foreground text-sm mt-2">Please wait while we verify your account.</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle className="h-12 w-12 mx-auto text-accent" />
            <h1 className="font-serif text-2xl mt-4">Account Activated</h1>
            <p className="text-muted-foreground text-sm mt-2">Your account is ready. Welcome to Akenga.</p>
            <Link
              to="/shop"
              className="mt-8 inline-flex px-8 py-3 bg-accent text-accent-foreground text-xs tracking-[0.25em] uppercase hover:bg-accent/90 transition"
            >
              Start Shopping
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="h-12 w-12 mx-auto text-destructive" />
            <h1 className="font-serif text-2xl mt-4">Activation Failed</h1>
            <p className="text-muted-foreground text-sm mt-2">{message}</p>
            <Link
              to="/register"
              className="mt-8 inline-flex px-8 py-3 border border-accent text-accent text-xs tracking-[0.25em] uppercase hover:bg-accent hover:text-accent-foreground transition"
            >
              Try Again
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
