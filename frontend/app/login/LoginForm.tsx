"use client";
import { useState } from "react";
import { login } from "@/api/auth";
import { useRouter } from "next/navigation";
import { Button } from "@mui/material";

const LoginForm = () => {
  const [email, setEmail] = useState("adam@friends.de");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    console.log(e);
    console.log(email, password);
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await login(email, password);
      console.log("Login successful:", data);
      router.push("/profile"); // Redirect on success
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-100 mx-auto my-10">
      <h1>Login</h1>
      <form onSubmit={handleLogin} className="space-y-4 mb-2">
        {error && <p className="text-red-600">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border p-2 w-full"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border p-2 w-full"
        />
        <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Log In"}
        </Button>
      </form>
      <Button
        variant="contained"
        color="primary"
        href={`${process.env.NEXT_PUBLIC_BACKEND_API_ENDPOINT}/auth/github`}
      >
        Login With Github
      </Button>
      <Button variant="contained" color="primary" href="/register">
        Register
      </Button>
    </div>
  );
};
export default LoginForm;
