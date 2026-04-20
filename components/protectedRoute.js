"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // 1. Retrieve data from sessionStorage
    const token = sessionStorage.getItem("userToken");
    const expiry = sessionStorage.getItem("userTokenExpiry");

    // 2. If no token exists, redirect to login immediately
    if (!token) {
      router.replace("/"); // Adjust "/" to your actual login route if different
      return;
    }

    // 3. Check if the token has expired
    if (expiry) {
      const expiryDate = new Date(expiry);
      const now = new Date();

      if (now > expiryDate) {
        // Token is expired: clear storage and redirect
        sessionStorage.removeItem("userToken");
        sessionStorage.removeItem("userTokenExpiry");
        router.replace("/");
        return;
      }
    }

    // 4. If token exists and is valid, allow rendering
    setIsAuthorized(true);
  }, [router]);

  // While checking credentials, show nothing (or a loading spinner) to prevent UI flashing
  if (!isAuthorized) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', color: '#64748b' }}>
        Verifying access...
      </div>
    );
  }

  // Render the protected content
  return <>{children}</>;
}