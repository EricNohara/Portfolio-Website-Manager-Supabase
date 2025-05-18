"use client";

import { useState, useEffect } from "react";
import { Box, Button, Table, TableContainer, TableHead, TableRow, Paper, TableCell, TableBody } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { ICourse } from "@/app/interfaces/ICourse";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function ExperienceList() {
  const router = useRouter();
  const [courses, setCourses] = useState<ICourse[]>([]);
  const searchParams = useSearchParams();
  const educationID = searchParams.get("educationID") as string;

  useEffect(() => {
    const fetcher = async () => {
      try {
        const res = await fetch(
          `/api/user/education/course?educationID=${encodeURIComponent(
            educationID
          )}`,
          {
            method: "GET",
          }
        );
        const data = await res.json();

        if (!res.ok) throw new Error("Failed to retrieve course data");

        setCourses(data);
      } catch (err) {
        alert(err);
      }
    };

    fetcher();
  }, [educationID]);

  const handleDelete = async (course: ICourse) => {
    try {
      const res = await fetch(
        `/api/user/education/course?educationID=${encodeURIComponent(
          course.education_id
        )}&courseName=${encodeURIComponent(course.name)}`,
        {
          method: "DELETE",
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      const removedCourses: ICourse[] = courses.filter(
        (c) => c.name !== course.name
      );

      setCourses(removedCourses);
      alert(data.message);
    } catch (err) {
      const error = err as Error;
      console.error(err);
      alert(error);
    }
  };

  return (
    <Box display="flex" flexDirection="column-reverse" width="100%">
      <TableContainer component={Paper} sx={{ marginBottom: "1rem" }}>
        <Table size="small" aria-label="Course Table">
          <TableHead>
            <TableRow>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Grade</strong></TableCell>
              <TableCell><strong>Description</strong></TableCell>
              <TableCell><strong>Edit</strong></TableCell>
              <TableCell><strong>Delete</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courses.map((row, i) => (
              <TableRow key={i} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell component="th" scope="row" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 200 }}>
                  {row.name}
                </TableCell>
                <TableCell align="left">{row.grade.length > 0 ? row.grade : "-"}</TableCell>
                <TableCell align="left">{row.description.length > 0 ? row.description : "-"}</TableCell>
                <TableCell align="left">
                  <Button
                    type="submit"
                    variant="text"
                    color="secondary"
                    onClick={() =>
                      router.push(
                        `/user/education/course/edit?educationID=${encodeURIComponent(
                          row.education_id
                        )}&courseName=${encodeURIComponent(row.name)}`
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
