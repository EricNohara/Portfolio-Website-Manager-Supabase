"use client";

import { Typography, Container } from "@mui/material";

import ConnectList from "./connect-list";

export default function Page() {
  return (
    <Container maxWidth="md">
      <Typography
        variant="h3"
        component="h2"
        className="text-center"
        fontWeight="bold"
        marginBottom="5%"
      >
        Connect to the API
      </Typography>
      <ConnectList />
    </Container>
  );
}
