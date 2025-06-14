"use client";
import { Alert, Button } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { logout } from "@/api/auth";
import Link from "next/link";

export const Menu = () => {
  const router = useRouter();
  const [error, setError] = useState("");

  const handleLogout = async () => {
    const response = await logout();
    if (response.success) {
      router.push("/login");
    } else {
      setError(response.error.message);
    }
  };

  return (
    <>
      {error && (
        <Alert className="absolute top-20 w-full" severity="error">
          {error}
        </Alert>
      )}
      <div className="flex w-full justify-between m-2">
        <Link href="/products">Shop</Link>
        <Link href="/cart">Cart</Link>
        <Link href="/orders">Orders</Link>
        <Link href="/profile">Profile</Link>
        <Button variant="contained" href="/login">
          Log in
        </Button>
        <Button variant="contained" onClick={handleLogout}>
          Log out
        </Button>
      </div>
    </>
  );
};
