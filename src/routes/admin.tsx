import { createFileRoute, Outlet, Link } from "@tanstack/react-router";
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
} from "@/components/ui/sidebar";
import { Boxes, FolderTree, Users, LayoutDashboard } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Akenga Arts Centre" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const linkClass = (active: boolean) =>
    `flex items-center gap-3 w-full ${active ? "text-accent" : "text-sidebar-foreground"}`;

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
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/60 px-6">
          <SidebarTrigger />
          <Link to="/" className="text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-accent transition-colors ml-auto">
            Back to Site
          </Link>
        </header>
        <div className="flex-1 p-6 lg:p-10">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
