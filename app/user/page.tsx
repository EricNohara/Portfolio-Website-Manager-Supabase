import { createClient } from "@/utils/supabase/server";
import { Container } from "@mui/material";
import UserList from "./user-list";
import { redirect } from "next/navigation";

export default async function AccountPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  return (
    <Container maxWidth="sm">
      <UserList user={user} />
    </Container>
  );
}
