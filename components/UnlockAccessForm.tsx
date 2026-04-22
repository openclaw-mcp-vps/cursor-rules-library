"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function UnlockAccessForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");

    const response = await fetch("/api/auth", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({ email })
    });

    const payload = (await response.json()) as { message?: string };

    if (!response.ok) {
      setMessage(payload.message || "Unable to verify purchase. Use the same email as checkout.");
      setIsLoading(false);
      return;
    }

    setMessage("Access unlocked. Reloading your rule library...");
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <form className="space-y-3" onSubmit={submit}>
      <label className="text-sm text-[var(--muted)]" htmlFor="purchase-email">
        Enter the same email you used at checkout
      </label>
      <Input
        id="purchase-email"
        type="email"
        required
        placeholder="you@company.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Verifying..." : "Unlock my subscription"}
      </Button>
      {message ? <p className="text-sm text-[#fbbf24]">{message}</p> : null}
    </form>
  );
}
