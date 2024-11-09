import { createClient } from "@/utils/supabase/server";
import { Container } from "@mui/material";
import UserList from "./user-list";

export default async function AccountPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <Container maxWidth="sm">
      <UserList user={user} />
    </Container>
  );
}
