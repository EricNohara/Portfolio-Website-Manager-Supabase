import CreateUserForm from "./create-user-form";
import { createClient } from "@/utils/supabase/server";
import { Typography, Container } from "@mui/material";

export default async function Account() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

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
      <CreateUserForm user={user} />
    </Container>
  );
}
