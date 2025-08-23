"use client";

import { Link, Button, TextField } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginForm() {
  const router = useRouter();
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prevCredentials) => ({
      ...prevCredentials,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/internal/auth/login", {
        method: "POST",
        headers: { ContentType: "application/json" },
        body: JSON.stringify(credentials),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      router.push("/user");
    } catch (err) {
      alert(err);
      setCredentials({ email: "", password: "" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <TextField
        label="email"
        name="email"
        required
        fullWidth
        onChange={handleChange}
        margin="normal"
        value={credentials.email}
      />
      <TextField
        label="password"
        name="password"
        required
        fullWidth
        onChange={handleChange}
        margin="normal"
        type="password"
        value={credentials.password}
      />
      <Button type="submit" variant="contained" color="primary" sx={{ mt: 3 }}>
        Sign In
      </Button>
      <Link
        underline="hover"
        align="center"
        marginTop="2rem"
        href="/user/create"
      >
        Sign Up
      </Link>
    </form>
  );
}
