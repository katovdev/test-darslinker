"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Password page is no longer needed with OTP-only authentication.
 * Redirects to login page.
 */
export default function PasswordPage() {
  const router = useRouter();

  useEffect(() => {
    // Clear any leftover session data from old auth flow
    sessionStorage.removeItem("tempUserData");
    sessionStorage.removeItem("userIdentifier");

    // Redirect to login
    router.replace("/login");
  }, [router]);

  return null;
}
