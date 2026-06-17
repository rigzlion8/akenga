import {
  createFileRoute,
  Outlet,
  Link,
  redirect,
} from "@tanstack/react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Boxes, FolderTree, Users, LayoutDashboard, GraduationCap, LogOut, Palette, Brush, PanelLeft, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser, logout } from "@/lib/api";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin — Akenga Arts Centre" }],
  }),
  beforeLoad: async () => {
    if (typeof window === "undefined") return {};
    const token = localStorage.getItem("auth_token");
    if (!token) throw redirect({ to: "/login" });
    try {
      const user = await getCurrentUser({ data: { token } });
      if (!user) throw redirect({ to: "/login" });
      return { user };
    } catch {
      throw redirect({ to: "/login" });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery({
    queryKey: ["auth", "current"],
    queryFn: async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) return null;
      try {
        return await getCurrentUser({ data: { token } });
      } catch {
        return null;
      }
    },
    enabled: typeof window !== "undefined",
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      try {
        await logout({ data: { token } });
      } catch {}
    }
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    queryClient.clear();
    toast.success("Signed out");
    window.location.href = "/login";
  };

  return (
    <SidebarProvider defaultOpen>
      <Sidebar variant="sidebar" collapsible="icon">
        <SidebarHeader>
          <Link to="/admin" className="flex items-center gap-2 px-2 py-3">
            <span className="w-8 h-8 rounded-full border border-accent flex items-center justify-center font-serif text-accent text-sm">A</span>
            <span className="font-serif text-lg tracking-wider group-data-[collapsible=icon]:hidden">Admin</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Management</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <Link to="/admin" activeOptions={{ exact: true }}>
                    {({ isActive }) => (
                      <SidebarMenuButton isActive={isActive} tooltip="Dashboard">
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Dashboard</span>
                      </SidebarMenuButton>
                    )}
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link to="/admin/products">
                    {({ isActive }) => (
                      <SidebarMenuButton isActive={isActive} tooltip="Products">
                        <Boxes className="h-4 w-4" />
                        <span>Products</span>
                      </SidebarMenuButton>
                    )}
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link to="/admin/classes">
                    {({ isActive }) => (
                      <SidebarMenuButton isActive={isActive} tooltip="Classes">
                        <GraduationCap className="h-4 w-4" />
                        <span>Classes</span>
                      </SidebarMenuButton>
                    )}
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link to="/admin/categories">
                    {({ isActive }) => (
                      <SidebarMenuButton isActive={isActive} tooltip="Categories">
                        <FolderTree className="h-4 w-4" />
                        <span>Categories</span>
                      </SidebarMenuButton>
                    )}
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link to="/admin/artists">
                    {({ isActive }) => (
                      <SidebarMenuButton isActive={isActive} tooltip="Artists">
                        <Palette className="h-4 w-4" />
                        <span>Artists</span>
                      </SidebarMenuButton>
                    )}
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link to="/admin/artworks">
                    {({ isActive }) => (
                      <SidebarMenuButton isActive={isActive} tooltip="Artworks">
                        <Brush className="h-4 w-4" />
                        <span>Artworks</span>
                      </SidebarMenuButton>
                    )}
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link to="/admin/exhibitions">
                    {({ isActive }) => (
                      <SidebarMenuButton isActive={isActive} tooltip="Exhibitions">
                        <CalendarDays className="h-4 w-4" />
                        <span>Exhibitions</span>
                      </SidebarMenuButton>
                    )}
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link to="/admin/users">
                    {({ isActive }) => (
                      <SidebarMenuButton isActive={isActive} tooltip="Users">
                        <Users className="h-4 w-4" />
                        <span>Users</span>
                      </SidebarMenuButton>
                    )}
                  </Link>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="px-2 pb-4">
            <p className="px-2 text-[0.6rem] tracking-[0.2em] uppercase text-muted-foreground group-data-[collapsible=icon]:hidden">
              {user.email}
            </p>
            <button
              onClick={handleLogout}
              className="mt-2 flex items-center gap-2 w-full rounded-md p-2 text-xs text-muted-foreground hover:text-destructive hover:bg-muted/50 transition-colors cursor-pointer group-data-[collapsible=icon]:justify-center"
            >
              <LogOut className="h-4 w-4" />
              <span className="group-data-[collapsible=icon]:hidden">Sign Out</span>
            </button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/60 px-6">
          <SidebarTrigger className="hidden md:flex" />
          <Link to="/" className="text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-accent transition-colors ml-auto">
            Back to Site
          </Link>
        </header>
        <div className="flex-1 p-6 lg:p-10">
          <Outlet />
        </div>
        {/* Mobile floating admin menu button */}
        <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
          <SidebarTrigger className="h-12 px-6 rounded-full bg-accent text-accent-foreground shadow-lg hover:bg-accent/90 text-sm font-medium gap-2">
            <PanelLeft className="h-4 w-4" />
            Admin Menu
          </SidebarTrigger>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
