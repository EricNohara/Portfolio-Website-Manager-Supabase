import CreateUserForm from "./create-user-form";
import { Typography, Container, Link } from "@mui/material";

export default async function CreateUserPage() {
  return (
    <Container maxWidth="sm">
      <Typography
        variant="h4"
        component="h2"
        gutterBottom
        className="text-center"
      >
        New User Sign Up
      </Typography>
      <CreateUserForm />
    </Container>
  );
}
