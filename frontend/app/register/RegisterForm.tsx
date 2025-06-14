"use client";
import { useState } from "react";
import { register } from "@/api/auth";
import { useRouter } from "next/navigation";

const RegisterForm = () => {
  const [name, setName] = useState("Meike");
  const [email, setEmail] = useState("meike@test.de");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    console.log(name, email, password);
    e.preventDefault();
    setLoading(true);
    setError("");

    const data = await register(name, email, password);

    if (!data.success) {
      setError(data.error.message);
      setLoading(false);
    } else {
      router.push("/login"); // Redirect on success
      setLoading(false);
      setError("");
    }
  };

  return (
    <div className="w-100 mx-auto my-10">
      <h1>Login</h1>
      <form onSubmit={handleRegister} className="space-y-4">
        {error && <p className="text-red-600">{error}</p>}
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="border p-2 w-full"
        />
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
        <button
          type="submit"
          className="bg-blue-600 text-white p-2"
          disabled={loading}
        >
          {loading ? "Loading..." : "Register"}
        </button>
      </form>
    </div>
  );
};
export default RegisterForm;
