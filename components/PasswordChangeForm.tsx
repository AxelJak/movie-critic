"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { pbApi } from "@/lib/api/pocketbase";

export default function PasswordChangeForm() {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    newPasswordConfirm: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear errors when user starts typing
    setError(null);
  };

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    // Validate new password
    const validationError = validatePassword(formData.newPassword);
    if (validationError) {
      setError(validationError);
      setIsSubmitting(false);
      return;
    }

    // Check passwords match
    if (formData.newPassword !== formData.newPasswordConfirm) {
      setError("New passwords do not match");
      setIsSubmitting(false);
      return;
    }

    try {
      await pbApi.changePassword(
        formData.oldPassword,
        formData.newPassword,
        formData.newPasswordConfirm
      );

      setSuccess("Password changed successfully");

      // Reset form
      setFormData({
        oldPassword: "",
        newPassword: "",
        newPasswordConfirm: "",
      });

      // Hide form after successful change
      setTimeout(() => {
        setShowForm(false);
        setSuccess(null);
      }, 2000);
    } catch (err) {
      console.error("Error changing password:", err);
      setError(
        "Failed to change password. Please check your current password and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!showForm) {
    return (
      <Card className="p-4 border-dashed">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Password</h3>
            <p className="text-sm text-muted-foreground">
              Change your account password
            </p>
          </div>
          <Button onClick={() => setShowForm(true)} variant="outline">
            Change Password
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4">Change Password</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="oldPassword">Current Password</Label>
          <Input
            id="oldPassword"
            name="oldPassword"
            type="password"
            value={formData.oldPassword}
            onChange={handleInputChange}
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <Label htmlFor="newPassword">New Password</Label>
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            value={formData.newPassword}
            onChange={handleInputChange}
            required
            minLength={8}
            disabled={isSubmitting}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Must be at least 8 characters long
          </p>
        </div>

        <div>
          <Label htmlFor="newPasswordConfirm">Confirm New Password</Label>
          <Input
            id="newPasswordConfirm"
            name="newPasswordConfirm"
            type="password"
            value={formData.newPasswordConfirm}
            onChange={handleInputChange}
            required
            minLength={8}
            disabled={isSubmitting}
          />
        </div>

        {error && (
          <div className="p-3 bg-destructive/15 text-destructive text-sm rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 text-green-700 text-sm rounded-md border border-green-200">
            {success}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setShowForm(false);
              setError(null);
              setSuccess(null);
              setFormData({
                oldPassword: "",
                newPassword: "",
                newPasswordConfirm: "",
              });
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Changing..." : "Change Password"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
