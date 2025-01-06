"use client";

import { Typography, Button, Container } from "@mui/material";
import { useRouter } from "next/navigation";
import SkillsList from "./skills-list";

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
        Skills
      </Typography>
      <SkillsList />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        onClick={() => router.push("/user/skills/add")}
        fullWidth
      >
        Add Skills
      </Button>
    </Container>
  );
}
