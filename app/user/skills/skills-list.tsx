"use client";

import { useState, useEffect } from "react";
import { ISkills } from "@/app/interfaces/ISkills";
import { useRouter } from "next/navigation";
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
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function SkillsList() {
  const router = useRouter();
  const [skills, setSkills] = useState<ISkills[]>([]);

  useEffect(() => {
    const fetcher = async () => {
      try {
        const res = await fetch("/api/user/skills", { method: "GET" });
        const data = await res.json();

        if (!res.ok) throw new Error("Failed to retrieve skills data");

        setSkills(data);
      } catch (err) {
        alert(err);
      }
    };

    fetcher();
  }, []);

  const handleDelete = async (skill: ISkills) => {
    try {
      const res = await fetch(`/api/user/skills?skillName=${skill.name}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      alert("Skill deleted successfully");

      const removedSkills: ISkills[] = skills.filter(
        (s) => s.name !== skill.name
      );

      setSkills(removedSkills);
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
                <strong>Name</strong>
              </TableCell>
              <TableCell>
                <strong>Proficiency</strong>
              </TableCell>
              <TableCell>
                <strong>Years of Experience</strong>
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
            {skills.map((row, i) => (
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
                  {row.name}
                </TableCell>
                <TableCell align="left">
                  {row.proficiency ? row.proficiency : "-"}
                </TableCell>
                <TableCell align="left">
                  {row.years_of_experience ? row.years_of_experience : "-"}
                </TableCell>
                <TableCell align="left">
                  <Button
                    type="submit"
                    variant="text"
                    color="secondary"
                    fullWidth
                    onClick={() =>
                      router.push(
                        `/user/skills/edit?skillName=${encodeURIComponent(
                          row.name
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
                    fullWidth
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
