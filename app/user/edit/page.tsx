import { createClient } from "@/utils/supabase/server";
import { Typography, Container } from "@mui/material";
import EditUserForm from "./edit-user-form";

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
      <EditUserForm user={user} />
    </Container>
  );
}
