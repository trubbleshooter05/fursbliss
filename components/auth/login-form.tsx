"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getProviders, signIn } from "next-auth/react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type FormValues = z.infer<typeof formSchema>;

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [googleEnabled, setGoogleEnabled] = useState(true);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const response = await signIn("credentials", {
        email: values.email.trim().toLowerCase(),
        password: values.password,
        redirect: false,
      });

      if (!response) {
        toast({
          title: "Unable to sign in",
          description: "No response from the server. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (response.error) {
        const message =
          response.error === "EMAIL_NOT_VERIFIED"
            ? "Please verify your email before signing in."
            : "Check your email and password, then try again.";
        toast({
          title: "Unable to sign in",
          description: message,
          variant: "destructive",
        });
        return;
      }

      if (!response.ok) {
        toast({
          title: "Unable to sign in",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
        return;
      }

      router.push("/dashboard");
    } catch (error) {
      toast({
        title: "Unable to sign in",
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const onGoogleSignIn = async () => {
    if (!googleEnabled) {
      toast({
        title: "Google sign-in unavailable",
        description:
          "Google auth is not enabled in this environment. Use email sign-in for now.",
        variant: "destructive",
      });
      return;
    }
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  useEffect(() => {
    let isMounted = true;
    void getProviders()
      .then((providers) => {
        if (!isMounted) return;
        setGoogleEnabled(Boolean(providers?.google));
      })
      .catch(() => {
        if (!isMounted) return;
        setGoogleEnabled(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={onGoogleSignIn}
          disabled={form.formState.isSubmitting || !googleEnabled}
        >
          {googleEnabled ? "Continue with Google" : "Google sign-in unavailable"}
        </Button>
        <p className="text-center text-xs text-muted-foreground">or use email</p>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="you@fursbliss.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Signing in..." : "Sign In"}
        </Button>
      </form>
    </Form>
  );
}
