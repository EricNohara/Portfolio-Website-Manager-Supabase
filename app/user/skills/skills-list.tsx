"use client";

import { useState, useEffect } from "react";
import { ISkills } from "@/app/interfaces/ISkills";
import { Box, Button, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

export default function ExperienceList() {
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

      alert(data.message);

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
      {skills.map((skill: ISkills, i: number) => (
        <Box
          display="flex"
          flexDirection="column"
          gap="0.5rem"
          padding="1rem"
          marginBottom="1rem"
          sx={{ border: 1, borderRadius: "0.25rem", borderColor: "#a1a1a1" }}
          key={i}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="body1" component="p" gutterBottom>
              {skill.name}
            </Typography>
            {skill.proficiency && (
              <Typography variant="body1" component="p" gutterBottom>
                <b>Proficiency: </b>
                {`${skill.proficiency}/10`}
              </Typography>
            )}
            {skill.years_of_experience && (
              <Typography variant="body1" component="p" gutterBottom>
                <b>Experience: </b>
                {`${skill.years_of_experience} years`}
              </Typography>
            )}
          </Box>
          <Box display="flex" gap="25%">
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              fullWidth
              onClick={() =>
                router.push(
                  `/user/skills/edit?skillName=${encodeURIComponent(
                    skill.name
                  )}`
                )
              }
            >
              Edit
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="error"
              fullWidth
              onClick={() => {
                handleDelete(skill);
              }}
            >
              Delete
            </Button>
          </Box>
        </Box>
      ))}
    </Box>
  );
}
