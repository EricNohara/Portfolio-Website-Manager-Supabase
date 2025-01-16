"use client";

import React from "react";
import { Container, Box, Typography } from "@mui/material";
import EditDocumentForm from "./edit-document-form";
import { useParams } from "next/navigation";

export default function Page() {
  const params = useParams();
  const documentType = params.type as string;
  const decodedDocumentType = decodeURIComponent(documentType);
  const formattedType =
    decodedDocumentType[0].toUpperCase() + decodedDocumentType.slice(1);

  return (
    <Container maxWidth="sm">
      <Box display="flex" flexDirection="column">
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          className="mt-10 text-center"
        >
          Edit {formattedType} Document
        </Typography>
        <EditDocumentForm />
      </Box>
    </Container>
  );
}
