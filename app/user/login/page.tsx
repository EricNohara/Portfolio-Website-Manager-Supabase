import LoginForm from "./login-form";
import React from "react";
import { Container, Typography } from "@mui/material";

export default function LoginUserPage() {
  return (
    <Container maxWidth="sm">
      <Typography
        variant="h3"
        component="h2"
        className="text-center"
        fontWeight="bold"
        marginBottom="5%"
      >
        Sign In
      </Typography>
      <LoginForm />
    </Container>
  );
}
