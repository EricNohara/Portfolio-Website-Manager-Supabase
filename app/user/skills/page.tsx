"use client";

import { Typography, Button, Container } from "@mui/material";
import { useRouter } from "next/navigation";

import SkillsList from "./skills-list";

export default function WorkExperiencePage() {
  const router = useRouter();

  return (
    <Container maxWidth="md">
      <Typography
        variant="h3"
        component="h2"
        className="text-center"
        fontWeight="bold"
        marginBottom="5%"
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
