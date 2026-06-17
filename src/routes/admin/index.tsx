import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getProducts, getCategories, getUsers, getClasses } from "@/lib/api";
import { getAllArtists } from "@/lib/api";
import { getExhibitions } from "@/lib/api";
import { Boxes, FolderTree, Users, GraduationCap, Palette, CalendarDays } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("auth_token") || "" : "";
}

function AdminDashboard() {
  const token = getToken();

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: () => getProducts(),
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
  });

  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: () => getUsers({ data: { token } }),
    enabled: !!token,
  });

  const { data: classes } = useQuery({
    queryKey: ["classes", "admin"],
    queryFn: () => getClasses(),
  });

  const { data: artists } = useQuery({
    queryKey: ["artists"],
    queryFn: () => getAllArtists(),
  });

  const { data: exhibitions } = useQuery({
    queryKey: ["exhibitions"],
    queryFn: () => getExhibitions(),
  });

  const stats = [
    { label: "Products", value: products?.length ?? "—", icon: Boxes, to: "/admin/products" },
    { label: "Artists", value: artists?.length ?? "—", icon: Palette, to: "/admin/artists" },
    { label: "Exhibitions", value: exhibitions?.length ?? "—", icon: CalendarDays, to: "/admin/exhibitions" },
    { label: "Classes", value: classes?.length ?? "—", icon: GraduationCap, to: "/admin/classes" },
    { label: "Categories", value: categories?.length ?? "—", icon: FolderTree, to: "/admin/categories" },
    { label: "Users", value: users?.length ?? "—", icon: Users, to: "/admin/users" },
  ];

  return (
    <>
      <h1 className="font-serif text-3xl md:text-5xl">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">Overview of your Akenga Arts Centre content.</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-10">
        {stats.map((s) => (
          <Link
            key={s.label}
            to={s.to}
            className="p-6 border border-border rounded-xl hover:border-accent/50 hover:bg-muted/30 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <s.icon className="h-5 w-5 text-accent" />
              </div>
              <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground">{s.label}</span>
            </div>
            <p className="font-serif text-4xl mt-4">{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-12 p-8 border border-dashed border-border rounded-xl">
        <p className="text-sm text-muted-foreground">Use the sidebar to manage Products, Categories, and Users. All changes are reflected immediately.</p>
      </div>
    </>
  );
}
