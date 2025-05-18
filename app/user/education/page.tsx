"use client";

import { Typography, Button, Container } from "@mui/material";
import { useRouter } from "next/navigation";
import EducationList from "./education-list";

export default function WorkExperiencePage() {
  const router = useRouter();

  return (
    <Container maxWidth="lg">
      <Typography
        variant="h3"
        component="h2"
        className="text-center"
        fontWeight="bold"
        marginBottom="5%"
      >
        Education
      </Typography>
      <EducationList />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        onClick={() => router.push("/user/education/add")}
        fullWidth
      >
        Add Education
      </Button>
    </Container>
  );
}
