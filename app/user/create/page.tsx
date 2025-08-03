import { Typography, Container } from "@mui/material";

import CreateUserForm from "./create-user-form";

export default async function CreateUserPage() {
  return (
    <Container maxWidth="sm">
      <Typography
        variant="h3"
        component="h2"
        className="text-center"
        fontWeight="bold"
        marginBottom="5%"
      >
        New User Sign Up
      </Typography>
      <CreateUserForm />
    </Container>
  );
}
