"use client";

import { Typography, Button, Container } from "@mui/material";
import { useRouter } from "next/navigation";

export default function WorkExperiencePage() {
  const router = useRouter();

  return (
    <Container maxWidth="sm">
      <Typography
        variant="h4"
        component="h2"
        gutterBottom
        className="text-center"
      >
        Work Experience
      </Typography>
      <Button
        type="submit"
        variant="contained"
        color="primary"
        sx={{ mt: 3 }}
        onClick={() => router.push("/user/experience/add")}
        fullWidth
      >
        Add Work Experience
      </Button>
    </Container>
  );
}
