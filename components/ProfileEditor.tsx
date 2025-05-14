"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/lib/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "@/lib/api/types";
import Image from "next/image";

interface ProfileEditorProps {
  onClose: () => void;
}

export default function ProfileEditor({ onClose }: ProfileEditorProps) {
  const { user, updateProfile, updateAvatar } = useAuth();
  
  const [formData, setFormData] = useState({
    name: user?.name || "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }
    
    // Preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Update profile info
      if (formData.name !== user?.name) {
        await updateProfile({ name: formData.name });
      }
      
      // Update avatar if a file was selected
      if (fileInputRef.current?.files?.length) {
        const file = fileInputRef.current.files[0];
        await updateAvatar(file);
      }
      
      setSuccess("Profile updated successfully");
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col md:flex-row gap-6 mb-6">
          {/* Avatar section */}
          <div className="flex flex-col items-center">
            <div 
              onClick={handleAvatarClick}
              className="relative w-32 h-32 rounded-full overflow-hidden mb-2 cursor-pointer border-2 border-dashed border-gray-300 hover:border-primary"
            >
              {avatarPreview ? (
                <Image 
                  src={avatarPreview} 
                  alt="Profile avatar" 
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-3xl">{user?.name.charAt(0) || '?'}</span>
                </div>
              )}
              
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-sm">Change avatar</span>
              </div>
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
            
            <span className="text-sm text-gray-500">Click to upload</span>
          </div>
          
          {/* Form fields */}
          <div className="flex-1 space-y-4">
            <div>
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user?.email || ""}
                disabled
                className="bg-gray-50"
              />
              <span className="text-xs text-gray-500 mt-1 block">Email cannot be changed</span>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
            {success}
          </div>
        )}
        
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Card>
  );
}