"use client";

import { useState } from "react";
import { login } from "./actions";
import { Link, Button, TextField } from "@mui/material";

export default function LoginForm() {
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

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        login(credentials.email, credentials.password);
      }}
      className="flex flex-col"
    >
      <TextField
        label="email"
        name="email"
        required
        fullWidth
        onChange={handleChange}
        margin="normal"
      />
      <TextField
        label="password"
        name="password"
        required
        fullWidth
        onChange={handleChange}
        margin="normal"
        type="password"
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
