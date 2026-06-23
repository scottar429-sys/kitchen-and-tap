"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginBox() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setCurrentUser(user?.email ?? null);
  }

  async function handleLogin() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    window.location.reload();
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.reload();
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold">Kitchen & Tap Login</h2>

      {currentUser ? (
        <>
          <p className="mb-4 text-green-700">
            Logged in as: {currentUser}
          </p>

          <button
            onClick={handleLogout}
            className="w-full rounded-lg border px-4 py-2 font-semibold"
          >
            Log Out
          </button>
        </>
      ) : (
        <>
          <input
            className="mb-2 w-full rounded-lg border p-2"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="mb-3 w-full rounded-lg border p-2"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handleLogin}
            className="w-full rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white"
          >
            Log In
          </button>
        </>
      )}
    </div>
  );
}