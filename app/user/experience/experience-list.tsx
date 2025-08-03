"use client";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  Button,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableCell,
  TableBody,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import { IExperience } from "@/app/interfaces/IExperience";
import { formatSimpleDate } from "@/utils/general/formatDate";


export default function ExperienceList() {
  const router = useRouter();
  const [userExperiences, setUserExperiences] = useState<IExperience[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetcher = async () => {
      try {
        const res = await fetch("/api/user/experience", { method: "GET" });
        const data = await res.json();

        if (!res.ok) throw new Error("Failed to retrieve experience data");

        setUserExperiences(data);
      } catch (err) {
        alert(err);
      }
    };

    fetcher();
  }, []);

  const handleDelete = async (exp: IExperience) => {
    try {
      const res = await fetch(
        `/api/user/experience?company=${exp.company}&job_title=${exp.job_title}`,
        { method: "DELETE" }
      );

      if (res.status === 204) {
        alert("Successfully deleted experience");
      } else {
        const data = await res.json();
        throw new Error(data.message);
      }

      const removedExperiences: IExperience[] = userExperiences.filter(
        (e) => e.company !== exp.company || e.job_title != exp.job_title
      );
      setUserExperiences(removedExperiences);
    } catch (err) {
      const error = err as Error;
      console.error(err);
      alert(error);
    }
  };

  return (
    <Box display="flex" flexDirection="column-reverse">
      <TableContainer component={Paper} sx={{ marginBottom: "1rem" }}>
        <Table size="small" aria-label="Course Table">
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Company</strong>
              </TableCell>
              <TableCell>
                <strong>Title</strong>
              </TableCell>
              <TableCell>
                <strong>Start</strong>
              </TableCell>
              <TableCell>
                <strong>End</strong>
              </TableCell>
              <TableCell>
                <strong>Description</strong>
              </TableCell>
              <TableCell>
                <strong>Edit</strong>
              </TableCell>
              <TableCell>
                <strong>Delete</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {userExperiences.map((row, i) => (
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
                  {row.company}
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
                  {row.job_title}
                </TableCell>
                <TableCell align="left">
                  {row.date_start ? formatSimpleDate(row.date_start) : "-"}
                </TableCell>
                <TableCell align="left">
                  {row.date_end ? formatSimpleDate(row.date_end) : "-"}
                </TableCell>
                <TableCell
                  align="left"
                  sx={{
                    cursor: row.job_description ? "pointer" : "default",
                    whiteSpace: expandedIndex === i ? "normal" : "nowrap",
                    overflow: expandedIndex === i ? "visible" : "hidden",
                    textOverflow: expandedIndex === i ? "clip" : "ellipsis",
                    maxWidth: 250,
                  }}
                  onClick={() => {
                    if (row.job_description) {
                      setExpandedIndex(expandedIndex === i ? null : i);
                    }
                  }}
                  title={row.job_description ?? undefined}
                >
                  {row.job_description
                    ? expandedIndex === i
                      ? row.job_description
                      : row.job_description
                    : "-"}
                </TableCell>
                <TableCell align="left">
                  <Button
                    type="submit"
                    variant="text"
                    color="secondary"
                    onClick={() =>
                      router.push(
                        `/user/experience/edit?company=${encodeURIComponent(
                          row.company
                        )}&job_title=${encodeURIComponent(
                          row.job_title
                        )}&date_start=${encodeURIComponent(
                          row.date_start || ""
                        )}&date_end=${encodeURIComponent(
                          row.date_end || ""
                        )}&job_description=${encodeURIComponent(
                          row.job_description || ""
                        )}`
                      )
                    }
                  >
                    <EditIcon />
                  </Button>
                </TableCell>
                <TableCell align="left">
                  <Button
                    type="submit"
                    variant="text"
                    color="error"
                    onClick={() => {
                      handleDelete(row);
                    }}
                  >
                    <DeleteIcon />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
