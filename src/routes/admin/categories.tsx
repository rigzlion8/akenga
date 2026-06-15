import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCategories, createCategory } from "@/lib/api";

const formSchema = z.object({ name: z.string().min(1, "Category name is required") });

export const Route = createFileRoute("/admin/categories")({
  component: AdminCategories,
});

function AdminCategories() {
  const queryClient = useQueryClient();
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{ name: string }>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: { name: string }) => {
    try {
      await createCategory({ data });
      toast.success("Category created");
      reset();
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    } catch {
      toast.error("Failed to create category");
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl md:text-5xl">Categories</h1>
          <p className="mt-2 text-muted-foreground text-sm">
            Manage product categories for the shop.
          </p>
        </div>
      </div>

      <div className="mt-8 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 border border-border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!categories || categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-muted-foreground py-12">
                    No categories yet.
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((c: any) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div>
          <div className="border border-border rounded-xl p-6">
            <h2 className="font-serif text-xl mb-4">Create Category</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...register("name")} placeholder="e.g. Textiles" />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
              </div>
              <Button type="submit" className="w-full cursor-pointer">
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
