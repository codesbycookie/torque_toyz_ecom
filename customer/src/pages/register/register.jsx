// export default function Register() {
//   return (
//     <div>
//       <h1>Register Page</h1>
//       {/* TODO: Implement register form */}
//     </div>
//   );
// }
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { Flag, ShieldCheck, Truck } from "lucide-react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/core/contexts/auth.context";
import { useAsync } from "@/core/hooks/useAsync";
import { useClearError } from "@/core/hooks/useClearError";
import { useSubmit } from "@/core/hooks/useSubmit";
import { registerSchema } from "@/modules/register/register.schema";
import RegisterForm from "@/modules/register/register.form";

export default function Register() {
  const { register } = useAuth();

  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      username: "",
      phone: "",
      password: "",
      confirmPassword: "",
      address: {
        door: "",
        street: "",
        city: "",
        state: "",
        pincode: undefined,
      },
      acceptTerms: false,
    },
  });

  const { run, loading, ErrorAlert, clearError } = useAsync(register);
  useClearError(form, clearError);

  const onSubmit = useSubmit({
    run,
    form,
    transform: ({ confirmPassword, ...data }) => ({ ...data, role: "user" }),
  });

  return (
    <div className="min-h-screen w-full bg-background text-foreground grid lg:grid-cols-2">
      <style>{`
        .checker-strip {
          background-image:
            linear-gradient(45deg, #000 25%, transparent 25%),
            linear-gradient(-45deg, #000 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #000 75%),
            linear-gradient(-45deg, transparent 75%, #000 75%);
          background-size: 18px 18px;
          background-position: 0 0, 0 9px, 9px -9px, -9px 0px;
          background-color: #fff;
        }
      `}</style>

      {/* Left — brand / hero */}
      <div className="hidden lg:flex relative flex-col justify-between overflow-hidden torque-dark-gradient px-14 py-12">
        <div
          className="absolute -left-10 top-1/4 w-[130%] h-10 torque-red-bg opacity-20"
          style={{ transform: "rotate(-10deg)" }}
        />
        <div
          className="absolute -left-10 top-1/3 w-[130%] h-4 torque-red-bg opacity-10"
          style={{ transform: "rotate(-10deg)" }}
        />

        <div className="relative flex items-center gap-3">
          <span className="animate-logo-intro inline-flex w-9 h-9 rounded-full border-2 border-dashed torque-border items-center justify-center">
            <img src="@/assets/hero.png" alt="Torque Toyzz Logo" />
          </span>
          <span className="text-white font-bold tracking-tight text-lg">TORQUE TOYZZ</span>
        </div>

        <div className="relative max-w-md">
          <span className="torque-badge mb-5">
            <Flag size={12} />
            Join the pit crew
          </span>
          <h1 className="text-white text-5xl font-bold tracking-tight leading-[1.05] mb-5">
            Build your
            <br />
            garage.
          </h1>
          <p className="text-white/60 text-[15px] leading-relaxed">
            Create an account to track orders, save your builds, and get first
            access to every new kit before it sells out.
          </p>
        </div>

        <div className="relative">
          <div className="checker-strip h-3 w-24 rounded-sm mb-4" />
          <p className="text-white/40 text-xs">© Torque Toyzz. Built for racers.</p>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center px-6 py-14 bg-background">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <span className="w-7 h-7 rounded-full torque-red-bg" />
            <span className="font-bold tracking-tight">TORQUE TOYZZ</span>
          </div>

          <div className="torque-card torque-glow p-8">
            <h2 className="text-2xl font-semibold tracking-tight mb-1">Create your account</h2>
            <p className="text-muted-foreground text-sm mb-7">
              Sign up to start shopping with Torque Toyzz.
            </p>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <RegisterForm form={form} />

                {ErrorAlert}

                <Button
                  type="submit"
                  loading={loading}
                  loadingText="Creating account..."
                  className="torque-button torque-shine w-full mt-2"
                >
                  Create account
                </Button>

                <p className="text-muted-foreground text-sm text-center pt-2">
                  Already have an account? <Link to="/login">Sign in</Link>
                </p>
              </form>
            </Form>
          </div>

          <div className="flex items-center justify-center gap-2 mt-6">
            <span className="torque-badge">
              <ShieldCheck size={12} />
              Secure checkout
            </span>
            <span className="torque-badge">
              <Truck size={12} />
              Fast RC shipping
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
