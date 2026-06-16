import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Key, Search, Loader2, Eye, EyeOff } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getUsers, createUser, updateUser, deleteUser, resetUserPassword } from "@/lib/api";

function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("auth_token") || "" : "";
}

const userFormSchema = z.object({
  email: z.string().email("Valid email required"),
  name: z.string().min(1, "Name is required"),
  password: z.string().min(6, "Minimum 6 characters"),
  role: z.string().optional(),
});

const editFormSchema = z.object({
  email: z.string().email("Valid email required"),
  name: z.string().min(1, "Name is required"),
  role: z.string().optional(),
});

const passwordSchema = z.object({
  password: z.string().min(6, "Minimum 6 characters"),
});

export const Route = createFileRoute("/admin/users")({
  component: AdminUsers,
});

function AdminUsers() {
  const queryClient = useQueryClient();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordUserId, setPasswordUserId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pwSubmitting, setPwSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const token = getToken();

  const { data: userList } = useQuery({
    queryKey: ["users"],
    queryFn: () => getUsers({ data: { token } }),
    enabled: !!token,
  });

  const filteredUsers = useMemo(() => {
    if (!userList) return [];
    if (!search.trim()) return userList;
    const q = search.toLowerCase();
    return userList.filter(
      (u: any) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q),
    );
  }, [userList, search]);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(editingId ? editFormSchema : userFormSchema),
  });

  const {
    register: pwRegister,
    handleSubmit: pwHandle,
    reset: pwReset,
    formState: { errors: pwErrors },
  } = useForm<{ password: string }>({
    resolver: zodResolver(passwordSchema),
  });

  const openCreate = () => {
    setEditingId(null);
    reset({ email: "", name: "", password: "", role: "user" });
    setShowPassword(false);
    setSheetOpen(true);
  };

  const openEdit = (u: any) => {
    setEditingId(u.id);
    reset({ email: u.email, name: u.name, role: u.role });
    setSheetOpen(true);
  };

  const openPassword = (u: any) => {
    setPasswordUserId(u.id);
    pwReset({ password: "" });
    setPasswordOpen(true);
  };

  const onSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      if (editingId) {
        await updateUser({ data: { token, id: editingId, email: data.email, name: data.name, role: data.role } });
        toast.success("User updated");
      } else {
        await createUser({ data: { token, email: data.email, name: data.name, password: data.password, role: data.role } });
        toast.success("User created");
      }
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setSheetOpen(false);
    } catch (e: any) {
      toast.error(e.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (u: any) => {
    if (!confirm(`Delete user "${u.name}"?`)) return;
    try {
      await deleteUser({ data: { token, id: u.id } });
      toast.success("User deleted");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    } catch (e: any) {
      toast.error(e.message || "Failed to delete");
    }
  };

  const handlePassword = async (data: { password: string }) => {
    if (!passwordUserId) return;
    setPwSubmitting(true);
    try {
      await resetUserPassword({ data: { token, id: passwordUserId, password: data.password } });
      toast.success("Password reset");
      setPasswordOpen(false);
      setPasswordUserId(null);
    } catch (e: any) {
      toast.error(e.message || "Failed to reset password");
    } finally {
      setPwSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl md:text-5xl">Users</h1>
          <p className="mt-2 text-muted-foreground text-sm">
            Manage user accounts. New users receive an activation email.
          </p>
        </div>

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button onClick={openCreate} className="cursor-pointer shrink-0">
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
            <SheetHeader className="mb-6">
              <SheetTitle>{editingId ? "Edit User" : "Create User"}</SheetTitle>
            </SheetHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" {...register("email")} placeholder="user@akenga.art" />
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message as string}</p>}
              </div>

              <div>
                <Label htmlFor="name">Name *</Label>
                <Input id="name" {...register("name")} placeholder="Full name" />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message as string}</p>}
              </div>

              {!editingId && (
                <div>
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      {...register("password")}
                      placeholder="Minimum 6 characters"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message as string}</p>}
                </div>
              )}

              <div>
                <Label>Role</Label>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="customer">Customer</SelectItem>
                        <SelectItem value="guest">Guest</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="operations">Operations</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <Button type="submit" className="w-full cursor-pointer" disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingId ? "Update User" : "Create User"}
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      <div className="mt-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="mt-4 border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="hidden sm:table-cell">Role</TableHead>
              <TableHead className="hidden sm:table-cell">Created</TableHead>
              <TableHead className="text-right w-28">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!filteredUsers || filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                  {search.trim() ? "No users match your search." : "No users yet."}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((u: any) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell className="text-sm">{u.email}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="secondary" className="text-[0.65rem]">{u.role}</Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openPassword(u)} className="cursor-pointer" title="Reset password">
                        <Key className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(u)} className="cursor-pointer">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(u)} className="cursor-pointer">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
          </DialogHeader>
          <form onSubmit={pwHandle(handlePassword)} className="space-y-4 mt-2">
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" {...pwRegister("password")} placeholder="Minimum 6 characters" />
              {pwErrors.password && <p className="text-xs text-destructive mt-1">{pwErrors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full cursor-pointer" disabled={pwSubmitting}>
              {pwSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Reset Password
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
