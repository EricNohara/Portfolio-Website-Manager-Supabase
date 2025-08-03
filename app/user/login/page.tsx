import { Container, Typography } from "@mui/material";
import React from "react";

import LoginForm from "./login-form";

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
