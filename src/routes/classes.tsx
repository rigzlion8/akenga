import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getClasses, submitEnrollment } from "@/lib/api";

export const Route = createFileRoute("/classes")({
  head: () => ({
    meta: [
      { title: "Classes — Akenga Conservatory" },
      { name: "description", content: "Intimate, rigorous music instruction across classical and traditional instruments at the Akenga Conservatory." },
      { property: "og:title", content: "Classes — Akenga Conservatory" },
      { property: "og:description", content: "Master an instrument under accomplished mentors in Nairobi." },
    ],
  }),
  component: Classes,
});

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  message: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

function Classes() {
  const queryClient = useQueryClient();
  const [enrollingClass, setEnrollingClass] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const { data: classes } = useQuery({
    queryKey: ["classes", "public"],
    queryFn: () => getClasses(),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onEnrollSubmit = async (data: FormValues) => {
    if (!enrollingClass) return;
    setSubmitting(true);
    try {
      await submitEnrollment({
        data: { classId: enrollingClass.id, ...data },
      });
      toast.success(`Enrollment submitted for ${enrollingClass.name}!`);
      reset();
      setEnrollingClass(null);
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
    } catch {
      toast.error("Failed to submit enrollment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section className="pt-36 pb-16 max-w-7xl mx-auto px-6 lg:px-10">
        <p className="eyebrow">Music Education</p>
        <h1 className="font-serif text-5xl md:text-7xl mt-4">Classes</h1>
        <p className="mt-6 max-w-2xl text-muted-foreground leading-relaxed">
          The Akenga Conservatory offers intimate, rigorous instruction across classical and traditional instruments. Choose your path and begin your musical journey.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
        <p className="eyebrow">The Conservatory</p>
        <h2 className="font-serif text-3xl md:text-5xl mt-3">Learn an Instrument</h2>
        <p className="mt-4 max-w-2xl text-muted-foreground">Refine your craft under the guidance of accomplished musicians in our intimate, world-class conservatory.</p>
        <div className="h-px bg-accent/40 my-10" />

        {!classes || classes.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No classes available at the moment. Check back soon.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {classes.map((c) => (
              <article key={c.id} className="group">
                <div className="aspect-[3/4] overflow-hidden bg-muted">
                  {c.imageUrl ? (
                    <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                      No image
                    </div>
                  )}
                </div>
                <h3 className="font-serif text-2xl md:text-3xl mt-5">{c.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{c.style}</p>
                {c.price && (
                  <p className="text-xs text-accent mt-1">{c.price}</p>
                )}
                <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                  <span className="text-[0.7rem] tracking-[0.2em] uppercase text-muted-foreground">{c.level}</span>
                  <button
                    onClick={() => setEnrollingClass(c)}
                    className="text-[0.7rem] tracking-[0.25em] uppercase text-accent hover:text-foreground cursor-pointer"
                  >
                    Enroll →
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <Dialog open={!!enrollingClass} onOpenChange={(open) => !open && setEnrollingClass(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{enrollingClass ? `Enroll in ${enrollingClass.name}` : "Enroll"}</DialogTitle>
          </DialogHeader>
          {enrollingClass && (
            <>
              <div className="text-sm text-muted-foreground space-y-1 mb-4">
                <p><strong>Style:</strong> {enrollingClass.style}</p>
                <p><strong>Level:</strong> {enrollingClass.level}</p>
                {enrollingClass.price && <p><strong>Price:</strong> {enrollingClass.price}</p>}
              </div>
              <form onSubmit={handleSubmit(onEnrollSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" {...register("name")} placeholder="Your full name" />
                  {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...register("email")} placeholder="you@example.com" />
                  {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input id="phone" {...register("phone")} placeholder="+254..." />
                </div>
                <div>
                  <Label htmlFor="message">Message (optional)</Label>
                  <Textarea id="message" {...register("message")} placeholder="Any questions or experience you'd like to share..." rows={3} />
                </div>
                <Button type="submit" className="w-full cursor-pointer" disabled={submitting}>
                  {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Submit Enrollment
                </Button>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>

      <section className="max-w-4xl mx-auto px-6 py-32 text-center">
        <p className="font-serif italic text-2xl md:text-3xl leading-relaxed text-foreground/85">
          “Music is the architecture of sound — and every student begins with a single note.”
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-24 text-center">
        <p className="eyebrow">Admissions</p>
        <p className="mt-4 text-muted-foreground">A new term begins September 2026. Seats per class are limited.</p>
        <button className="mt-6 px-8 py-3 border border-accent text-accent text-xs tracking-[0.25em] uppercase hover:bg-accent hover:text-accent-foreground transition">Request a Prospectus</button>
      </section>
    </>
  );
}
