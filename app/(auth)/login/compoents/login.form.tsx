"use client";

import { Controller, SubmitHandler, useForm } from "react-hook-form";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Form,
  Input,
} from "@heroui/react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@lib/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type TLoginSchema = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const supabase = createClient();

  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<TLoginSchema>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<TLoginSchema> = async (data) => {
    setFormError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword(data);

      if (error) {
        // Supabase specific error mapping
        if (error.message.toLowerCase().includes("invalid login credentials")) {
          throw new Error("Invalid email or password");
        }
        throw error;
      }

      router.replace("/");
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card shadow="sm" className="w-full max-w-sm">
      <CardHeader className="flex flex-col gap-1">
        <p className="text-xl font-semibold">Login</p>
        <p className="text-sm text-default-500">
          Welcome back to Mehfil Dashboard
        </p>
      </CardHeader>

      <CardBody className="gap-4">
        <Form onSubmit={handleSubmit(onSubmit)} validationBehavior="aria">
          {/* EMAIL */}
          <Controller
            control={control}
            name="email"
            render={({ field, fieldState }) => (
              <Input
                {...field}
                size="sm"
                label="Email"
                type="email"
                isRequired
                autoComplete="email"
                isInvalid={fieldState.invalid}
                errorMessage={fieldState.error?.message}
              />
            )}
          />

          {/* PASSWORD */}
          <Controller
            control={control}
            name="password"
            render={({ field, fieldState }) => (
              <Input
                {...field}
                size="sm"
                label="Password"
                type="password"
                isRequired
                autoComplete="current-password"
                isInvalid={fieldState.invalid}
                errorMessage={fieldState.error?.message}
              />
            )}
          />

          {/* FORM ERROR */}
          {formError && (
            <p className="text-sm text-danger mt-2">{formError}</p>
          )}

          {/* SUBMIT */}
          <Button
            size="sm"
            fullWidth
            color="primary"
            variant="flat"
            type="submit"
            isDisabled={!isValid || loading}
            isLoading={loading}
          >
            Login
          </Button>
        </Form>
      </CardBody>
    </Card>
  );
}
