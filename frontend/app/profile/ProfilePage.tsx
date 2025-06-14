"use client";

import { useEffect, useState } from "react";
import { getAuthUser } from "@/api/user";
import { useRouter } from "next/navigation";

export interface UserType {
  id: number;
  name: string;
  email: string;
}

export default function ProfilePage() {
  const [authUser, setAuthUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getAuthUser();
        if (!user) {
          router.push("/login"); // Redirect if not authenticated
          return;
        }
        setAuthUser(user);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        router.push("/login"); // Optional: redirect or show error
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  if (loading) return <p>Loading...</p>;
  if (!authUser) return null; // Will redirect anyway

  return (
    <div>
      <h1>Welcome, {authUser.name}</h1>
      <p>Email: {authUser.email}</p>
    </div>
  );
}
