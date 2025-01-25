"use client";

import { useState, useEffect } from "react";
import {
  Snackbar,
  Button,
  Box,
  TextField,
  Divider,
  Typography,
} from "@mui/material";
import * as React from "react";
import { SnackbarCloseReason } from "@mui/material/Snackbar";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

export default function ConnectList() {
  const [open, setOpen] = React.useState(false);
  const [apiKey, setApiKey] = useState<string>("");
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const fetcher = async () => {
      try {
        const res = await fetch("/api/auth/key");
        const data = await res.json();

        if (!res.ok) throw new Error(data.message);

        const key = data[0].encrypted_key;
        setApiKey(key);
      } catch (error) {
        console.error(error);
      }
    };

    fetcher();
  });

  const handleClick = () => {
    // copy key and show snackbar
    navigator.clipboard.writeText(apiKey);
    setOpen(true);
  };

  const handleClose = (
    event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  const action = (
    <React.Fragment>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  const setStars = (key: string) => {
    return key.replace(/./g, "*");
  };

  const toggleHidden = () => {
    setIsVisible(!isVisible);
  };

  const handleGenerateNewAPIKey = async () => {
    try {
      const res = await fetch("/api/auth/key", { method: "POST" });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      alert("API key generated successfully");

      setApiKey(data.encrypted_key);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      gap="2rem"
    >
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        gap="2rem"
        border="1px solid lightgrey"
        padding="2rem"
        borderRadius="0.5rem"
      >
        <Box display="flex" justifyContent="space-between">
          <Typography fontWeight="bold" variant="h5">
            Private API Key
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleGenerateNewAPIKey}
          >
            Generate New Key
          </Button>
        </Box>

        <Divider />
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          gap="2%"
        >
          <Button
            variant="contained"
            color="primary"
            sx={{ height: "100%" }}
            onClick={toggleHidden}
          >
            {isVisible ? <VisibilityIcon /> : <VisibilityOffIcon />}
          </Button>
          <TextField
            label="API Key"
            onChange={() => {}}
            value={isVisible ? apiKey : setStars(apiKey)}
            fullWidth
          ></TextField>
          <Button variant="contained" color="primary" onClick={handleClick}>
            <ContentCopyIcon />
          </Button>
          <Snackbar
            open={open}
            autoHideDuration={5000}
            onClose={handleClose}
            message="Copied to Clipboard"
            action={action}
          />
        </Box>
      </Box>
    </Box>
  );
}
