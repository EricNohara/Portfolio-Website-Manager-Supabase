"use client";

import { IApiKey } from "@/app/interfaces/IApiKey";
import {
  Snackbar,
  Button,
  Box,
  TextField,
  Divider,
  Typography,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableCell,
  TableBody,
} from "@mui/material";
import * as React from "react";
import { useState, useEffect } from "react";

export default function ConnectList() {
  const [apiKeys, setApiKeys] = useState<IApiKey[]>([]);
  const [description, setDescription] = useState("");
  const [expires, setExpires] = useState("");
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    const fetcher = async () => {
      try {
        const res = await fetch("/api/internal/auth/key");
        const data = await res.json();

        if (!res.ok) throw new Error(data.message);

        setApiKeys(data.keys);
        console.log(apiKeys);
      } catch (error) {
        console.error(error);
      }
    };

    fetcher();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/internal/auth/key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, expires: expires || null }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      // Add new key to table
      setApiKeys((prev) => [
        ...prev,
        {
          description,
          created: new Date().toISOString(),
          expires: expires || null,
        } as IApiKey,
      ]);

      setDescription("");
      setExpires("");
      prompt(
        "API key generated! Copy it now. You won't see it again.",
        data.encrypted_key
      );
    } catch (error) {
      console.error(error);
      alert("Failed to create API key");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (key: IApiKey) => {
    try {
      // calculate new expires field
      const createdTime = new Date(key.created).getTime();
      const expiresTime = key.expires ? new Date(key.expires).getTime() : null;

      let newExpiry: string | null = null;

      if (expiresTime) {
        const duration = expiresTime - createdTime; // validity period
        newExpiry = new Date(Date.now() + duration).toISOString();
      }

      const res = await fetch("/api/internal/auth/key", {
        method: "PUT", headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: key.description,
          expires: newExpiry,
        }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      prompt(
        "API key refreshed! Copy it now. You won't see it again.",
        data.encrypted_key
      );

      // update the table with the new expiry
      setApiKeys((prev) =>
        prev.map((k) =>
          k.description === key.description
            ? { ...k, created: new Date().toISOString(), expires: newExpiry }
            : k
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (key: IApiKey) => {
    try {
      const res = await fetch(`/api/internal/auth/key?description=${key.description}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error deleting key");

      alert(`API key for ${key.description} successfully deleted`);

      // Remove the deleted key from state
      setApiKeys((prev) =>
        prev.filter((k) => k.description !== key.description)
      );
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <Box display="flex" flexDirection="column">
      {/* Form to create new API key */}
      <Paper sx={{ padding: 2, marginBottom: "1rem" }}>
        <Typography variant="h6" gutterBottom>
          Create New API Key
        </Typography>
        <Box
          component="form"
          display="flex"
          gap={2}
          alignItems="center"
          onSubmit={handleCreate}
        >
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <TextField
            label="Expires"
            type="datetime-local"
            value={expires}
            onChange={(e) => setExpires(e.target.value)}
          />
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? "Creating..." : "Create Key"}
          </Button>
        </Box>
      </Paper>

      {/* API Keys Table */}
      <TableContainer component={Paper} sx={{ marginBottom: "1rem" }}>
        <Table size="small" aria-label="API Keys">
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Description</strong>
              </TableCell>
              <TableCell>
                <strong>Created</strong>
              </TableCell>
              <TableCell>
                <strong>Expires</strong>
              </TableCell>
              <TableCell>
                <strong>Actions</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {apiKeys.map((key, i) => (
              <TableRow
                key={i}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell
                  component="th"
                  scope="row"
                  sx={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: 200,
                  }}
                >
                  {key.description}
                </TableCell>
                <TableCell
                  align="left"
                  sx={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: 200,
                  }}
                >
                  {key.created}
                </TableCell>
                <TableCell
                  align="left"
                  sx={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: 200,
                  }}
                >
                  {key.expires ? key.expires : "Never"}
                </TableCell>
                <TableCell align="left">
                  <Button
                    type="submit"
                    variant="text"
                    color="secondary"
                    onClick={() => handleRefresh(key)}
                  >
                    Refresh
                  </Button>
                </TableCell>
                <TableCell align="left">
                  <Button
                    type="submit"
                    variant="text"
                    color="error"
                    onClick={() => handleDelete(key)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box >
  );
}
