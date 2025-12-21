"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { pbApi } from "@/lib/api/pocketbase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      await pbApi.requestPasswordReset(email);
      setSuccess(true);
      setEmail("");
    } catch (error) {
      console.error("Password reset error:", error);
      setError(
        "Failed to send password reset email. Please check your email address and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 flex flex-col items-center min-h-[calc(100vh-200px)] justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Forgot Password
        </h1>

        <Card>
          <CardContent className="p-6">
            {success ? (
              <div className="space-y-4">
                <div className="bg-green-50 text-green-700 text-sm p-4 rounded-md border border-green-200">
                  <p className="font-semibold mb-2">Email Sent!</p>
                  <p>
                    If an account exists with that email address, you will
                    receive a password reset link shortly. Please check your
                    inbox and spam folder.
                  </p>
                </div>

                <div className="text-center">
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/login">Back to Login</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="text-center mb-4">
                  <p className="text-sm text-muted-foreground">
                    Enter your email address and we&apos;ll send you a link to
                    reset your password.
                  </p>
                </div>

                {error && (
                  <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !email}
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>

                <div className="text-center">
                  <Link
                    href="/login"
                    className="text-sm underline-offset-4 hover:underline text-muted-foreground"
                  >
                    Back to Login
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
