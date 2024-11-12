import React from "react";
import { Container, Box, Typography } from "@mui/material";
import EditDocumentsForm from "./edit-documents-form";

export default function LoginUserPage() {
  return (
    <Container maxWidth="sm">
      <Box display="flex" flexDirection="column">
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          className="mt-10 text-center"
        >
          Edit Documents
        </Typography>
        <EditDocumentsForm />
      </Box>
    </Container>
  );
}
