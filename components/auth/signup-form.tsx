"use client";

import { useRouter, useSearchParams } from "next/navigation";
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
import { trackMetaEvent } from "@/lib/meta-events";

const formSchema = z.object({
  name: z.string().min(1, "Please enter your name."),
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  referralCode: z.string().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;
type QuizSnapshot = {
  dogName: string;
  breed: string;
  age: number;
  weight: number;
  concerns: string[];
};

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null);
  const [quizSnapshot, setQuizSnapshot] = useState<QuizSnapshot | null>(null);
  const [googleEnabled, setGoogleEnabled] = useState(true);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      referralCode: "",
    },
  });

  useEffect(() => {
    const referral = searchParams.get("ref");
    if (referral) {
      form.setValue("referralCode", referral);
    }

    const email = searchParams.get("email");
    if (email) {
      form.setValue("email", email);
    }

    const breed = searchParams.get("breed");
    const age = Number(searchParams.get("age"));
    const weight = Number(searchParams.get("weight"));
    const dogName = searchParams.get("dogName") ?? "";
    const concerns = (searchParams.get("concerns") ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (
      breed &&
      Number.isFinite(age) &&
      age > 0 &&
      Number.isFinite(weight) &&
      weight > 0
    ) {
      setQuizSnapshot({
        dogName,
        breed,
        age,
        weight,
        concerns,
      });
    }
  }, [searchParams, form]);

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

  const onSubmit = async (values: FormValues) => {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...values,
        quizSnapshot,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      toast({
        title: "Sign up failed",
        description: data?.message ?? "Something went wrong. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (data?.verificationUrl) {
      setVerificationUrl(data.verificationUrl);
      toast({
        title: "Verify your email",
        description: "Use the verification link below to activate your account.",
      });
      return;
    }

    await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    await trackMetaEvent("CompleteRegistration", {
      content_name: "account_created",
    });

    router.push("/dashboard");
  };

  const onGoogleSignUp = async () => {
    if (!googleEnabled) {
      toast({
        title: "Google sign-in unavailable",
        description:
          "Google auth is not enabled in this environment. Use email signup for now.",
        variant: "destructive",
      });
      return;
    }
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {quizSnapshot ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              Continuing from your quiz result: we&apos;ll carry over{" "}
              {quizSnapshot.dogName ? `${quizSnapshot.dogName}'s` : "your dog's"}{" "}
              {quizSnapshot.breed}, age {quizSnapshot.age}, and weight{" "}
              {quizSnapshot.weight} lbs after signup.
            </div>
          ) : null}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={onGoogleSignUp}
            disabled={form.formState.isSubmitting || !googleEnabled}
          >
            {googleEnabled ? "Continue with Google" : "Google sign-up unavailable"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">or create with email</p>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Avery Johnson" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
          <FormField
            control={form.control}
            name="referralCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Referral code (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="FRIEND2024" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Creating account..." : "Create Account"}
          </Button>
        </form>
      </Form>
      {verificationUrl && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          Dev link:{" "}
          <a className="font-semibold underline" href={verificationUrl}>
            {verificationUrl}
          </a>
        </div>
      )}
    </>
  );
}
