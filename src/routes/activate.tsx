import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { activateAccount } from "@/lib/api";

export const Route = createFileRoute("/activate")({
  head: () => ({ meta: [{ title: "Activate — Akenga Arts Centre" }] }),
  component: Activate,
});

function Activate() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [role, setRole] = useState<string | null>(null);

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
        setRole(result.user.role);
        setStatus("success");
      })
      .catch((e) => {
        setStatus("error");
        setMessage(e.message || "Activation failed.");
      });
  }, []);

  const isArtist = role === "artist";
  const dashboardUrl = "/dashboard";
  const shopUrl = "/shop";

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
            <p className="text-muted-foreground text-sm mt-2">
              {isArtist ? "Your artist account is ready. Complete your profile to get started." : "Your account is ready. Welcome to Akenga."}
            </p>
            <div className="flex flex-col gap-3 mt-8 items-center">
              <Link
                to={isArtist ? dashboardUrl : shopUrl}
                className="inline-flex items-center gap-2 px-8 py-3 bg-accent text-accent-foreground text-xs tracking-[0.25em] uppercase hover:bg-accent/90 transition rounded-md"
              >
                {isArtist ? "Complete Profile" : "Start Shopping"}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                to={isArtist ? shopUrl : dashboardUrl}
                className="text-xs text-muted-foreground hover:text-accent transition-colors"
              >
                {isArtist ? "Skip for now, browse shop" : "Go to Dashboard"}
              </Link>
            </div>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="h-12 w-12 mx-auto text-destructive" />
            <h1 className="font-serif text-2xl mt-4">Activation Failed</h1>
            <p className="text-muted-foreground text-sm mt-2">{message}</p>
            <Link to="/register" className="mt-6 inline-block text-xs text-accent hover:underline">
              Try registering again
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
