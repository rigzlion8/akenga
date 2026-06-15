import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsers,
});

function AdminUsers() {
  return (
    <>
      <h1 className="font-serif text-3xl md:text-5xl">Users</h1>
      <p className="mt-2 text-muted-foreground text-sm">
        User management for the admin panel.
      </p>

      <div className="mt-10 flex flex-col items-center justify-center py-24 border border-dashed border-border rounded-xl">
        <Users className="h-12 w-12 text-muted-foreground/40" />
        <p className="mt-4 font-serif text-xl text-muted-foreground">Coming Soon</p>
        <p className="mt-1 text-sm text-muted-foreground/60">
          User management will be available in the next phase. This will include admin role management, invitations, and access control.
        </p>
      </div>
    </>
  );
}
