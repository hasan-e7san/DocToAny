"use client";

import { FormEvent, useState } from "react";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface SettingsFormProps {
  initialName: string;
  initialEmail: string;
}

export function SettingsForm({ initialName, initialEmail }: SettingsFormProps) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  async function onProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileMessage("");
    setSavingProfile(true);

    const sanitizedName = name.trim();
    const sanitizedEmail = email.trim().toLowerCase();

    if (sanitizedName.length < 2) {
      setSavingProfile(false);
      setProfileMessage("Name must be at least 2 characters.");
      return;
    }

    if (!EMAIL_PATTERN.test(sanitizedEmail)) {
      setSavingProfile(false);
      setProfileMessage("Please enter a valid email address.");
      return;
    }

    const response = await fetch("/api/me/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: sanitizedName, email: sanitizedEmail }),
    });

    const payload = await response.json().catch(() => ({}));
    setSavingProfile(false);

    if (!response.ok) {
      setProfileMessage(payload.error ?? "Failed to update profile.");
      return;
    }

    setProfileMessage("Profile updated successfully.");
  }

  async function onPasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordMessage("");

    const currentPasswordValue = currentPassword.trim();
    const newPasswordValue = newPassword.trim();

    if (!newPasswordValue) {
      setPasswordMessage("New password is required.");
      return;
    }

    if (newPasswordValue.length < 8) {
      setPasswordMessage("New password must be at least 8 characters.");
      return;
    }

    if (!currentPasswordValue) {
      setPasswordMessage("Current password is required.");
      return;
    }

    setSavingPassword(true);

    const response = await fetch("/api/me/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: currentPasswordValue,
        newPassword: newPasswordValue,
      }),
    });

    const payload = await response.json().catch(() => ({}));
    setSavingPassword(false);

    if (!response.ok) {
      setPasswordMessage(payload.error ?? "Failed to update password.");
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setPasswordMessage("Password updated successfully.");
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="text-base font-semibold text-zinc-900">Profile Information</h2>
        <p className="mt-1 text-sm text-zinc-600">Update your display name and login email.</p>

        <form onSubmit={onProfileSubmit} className="mt-5 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-sm font-medium text-zinc-700">Name</label>
            <input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-zinc-500"
              placeholder="Your name"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-zinc-700">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-zinc-500"
              placeholder="you@example.com"
              required
            />
          </div>

          <button
            type="submit"
            disabled={savingProfile}
            className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-70"
          >
            {savingProfile ? "Saving..." : "Save profile"}
          </button>

          {profileMessage ? <p className="rounded-md bg-zinc-100 p-2 text-sm text-zinc-700">{profileMessage}</p> : null}
        </form>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="text-base font-semibold text-zinc-900">Password</h2>
        <p className="mt-1 text-sm text-zinc-600">Change your password securely.</p>

        <form onSubmit={onPasswordSubmit} className="mt-5 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="currentPassword" className="text-sm font-medium text-zinc-700">Current Password</label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-zinc-500"
              placeholder="Current password"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="newPassword" className="text-sm font-medium text-zinc-700">New Password</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-zinc-500"
              placeholder="At least 8 characters"
              minLength={8}
              required
            />
          </div>

          <button
            type="submit"
            disabled={savingPassword}
            className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-70"
          >
            {savingPassword ? "Updating..." : "Update password"}
          </button>

          {passwordMessage ? <p className="rounded-md bg-zinc-100 p-2 text-sm text-zinc-700">{passwordMessage}</p> : null}
        </form>
      </section>
    </div>
  );
}
