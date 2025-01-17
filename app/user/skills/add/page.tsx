import { Typography, Link, Container } from "@mui/material";
import AddSkillsForm from "./add-skills-form";

export default function AddExperiencePage() {
  return (
    <Container
      maxWidth="sm"
      sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <Typography
        variant="h3"
        component="h2"
        className="text-center"
        fontWeight="bold"
        marginBottom="5%"
      >
        Add Skills
      </Typography>
      <AddSkillsForm />
      <Link
        underline="hover"
        align="center"
        marginTop="1rem"
        href="/user/skills"
      >
        Return
      </Link>
    </Container>
  );
}
