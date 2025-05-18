"use client";

import { useState, useEffect } from "react";
import { Box, Button, Table, TableContainer, TableHead, TableRow, Paper, TableCell, TableBody } from "@mui/material";
import { useRouter } from "next/navigation";
import { IEducation } from "@/app/interfaces/IEducation";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function ExperienceList() {
  const router = useRouter();
  const [userEducation, setUserEducation] = useState<IEducation[]>([]);

  useEffect(() => {
    const fetcher = async () => {
      try {
        const res = await fetch("/api/user/education", { method: "GET" });
        const data = await res.json();

        if (!res.ok) throw new Error("Failed to retrieve experience data");

        setUserEducation(data);
      } catch (err) {
        alert(err);
      }
    };

    fetcher();
  }, []);

  const handleDelete = async (exp: IEducation) => {
    try {
      const res = await fetch(`/api/user/education?id=${exp.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      const removedEducation: IEducation[] = userEducation.filter(
        (e) => e.id !== exp.id
      );
      setUserEducation(removedEducation);
      alert(data.message);
    } catch (err) {
      const error = err as Error;
      console.error(err);
      alert(error);
    }
  };

  return (
    <Box display="flex" flexDirection="column-reverse">
      <TableContainer component={Paper} sx={{ marginBottom: "1rem" }}>
        <Table size="small" aria-label="Education Table">
          <TableHead>
            <TableRow>
              <TableCell><strong>Institution</strong></TableCell>
              <TableCell><strong>Degree</strong></TableCell>
              <TableCell><strong>Majors</strong></TableCell>
              <TableCell><strong>Minors</strong></TableCell>
              <TableCell><strong>GPA</strong></TableCell>
              <TableCell><strong>Start</strong></TableCell>
              <TableCell><strong>End</strong></TableCell>
              <TableCell><strong>Awards</strong></TableCell>
              <TableCell><strong>Courses</strong></TableCell>
              <TableCell><strong>Edit</strong></TableCell>
              <TableCell><strong>Delete</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {userEducation.map((row, i) => (
              <TableRow key={i} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell component="th" scope="row" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 200 }}>
                  {row.institution}
                </TableCell>
                <TableCell align="left">{row.degree}</TableCell>
                <TableCell align="left">{row.majors.length > 0 ? row.majors.join(", ") : "-"}</TableCell>
                <TableCell align="left">{row.minors.length > 0 ? row.minors.join(", ") : "-"}</TableCell>
                <TableCell align="left">{row.gpa ? row.gpa : "-"}</TableCell>
                <TableCell align="left">{row.year_start ? row.year_start : "-"}</TableCell>
                <TableCell align="left">{row.year_end ? row.year_end : "-"}</TableCell>
                <TableCell align="left">{row.awards.length > 0 ? row.awards.join(", ") : "-"}</TableCell>
                <TableCell align="left">
                  <Button
                    type="submit"
                    variant="text"
                    color="info"
                    onClick={() => {
                      router.push(
                        `/user/education/course?educationID=${encodeURIComponent(
                          row.id
                        )}`
                      );
                    }}
                  >
                    View
                  </Button>
                </TableCell>
                <TableCell align="left">
                  <Button
                    type="submit"
                    variant="text"
                    color="secondary"
                    onClick={() =>
                      router.push(
                        `/user/education/edit?id=${encodeURIComponent(row.id)}`
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
