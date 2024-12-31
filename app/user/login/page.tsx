import LoginForm from "./login-form";
import React from "react";
import { Container, Typography } from "@mui/material";

export default function LoginUserPage() {
  return (
    <Container maxWidth="sm">
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        className="mt-10 text-center"
      >
        Sign In
      </Typography>
      <LoginForm />
    </Container>
  );
}
