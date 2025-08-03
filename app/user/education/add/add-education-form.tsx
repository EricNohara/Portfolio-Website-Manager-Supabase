"use client";

import { Button, TextField, Box } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { IEducationInput } from "@/app/interfaces/IEducation";

export default function AddExperienceForm() {
  const router = useRouter();
  const [education, setEducation] = useState<IEducationInput>({
    degree: "",
    majors: [],
    minors: [],
    gpa: null,
    institution: "",
    awards: [],
    year_start: null,
    year_end: null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setEducation((prevData) => {
      if (["majors", "minors", "awards"].includes(name)) {
        return {
          ...prevData,
          [name]: value ? value.split(",").map((item) => item) : [],
        };
      }
      return {
        ...prevData,
        [name]: value,
      };
    });
  };

  const handleYearChange = (field: string, year: number | null) => {
    setEducation((prev) => ({
      ...prev,
      [field]: year || null,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!education.institution.trim() || !education.degree.trim()) {
      alert("Please fill out all required fields.");
      return;
    }

    try {
      const res = await fetch("/api/user/education", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(education),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      alert(data.message);
      router.push("/user/education");
    } catch (err) {
      console.error(err);
      const error = err as Error;
      alert(error.message);
    }
  };

  return (
    <form>
      <TextField
        label="Institution Name"
        name="institution"
        onChange={handleChange}
        fullWidth
        margin="dense"
        size="medium"
        value={education.institution}
        required
      ></TextField>
      <Box display="flex" gap="2%">
        <TextField
          label="Degree"
          name="degree"
          onChange={handleChange}
          fullWidth
          margin="dense"
          size="medium"
          value={education.degree}
          required
        ></TextField>
        <TextField
          label="Grade Point Average"
          name="gpa"
          type="number"
          onChange={handleChange}
          fullWidth
          margin="dense"
          size="medium"
          value={education.gpa ? education.gpa : ""}
          InputProps={{
            inputProps: { max: 4, step: 0.001 }, // Works as intended
          }}
        ></TextField>
      </Box>
      <Box display="flex" gap="2%" marginTop="0.5rem">
        <DatePicker
          label="Year Start"
          name="year_start"
          views={["year"]}
          value={education.year_start ? dayjs(`${education.year_start}`) : null}
          onChange={(val) =>
            handleYearChange("year_start", val ? val.year() : null)
          }
          sx={{ width: "100%" }}
        ></DatePicker>
        <DatePicker
          label="Year End"
          name="year_end"
          views={["year"]}
          value={education.year_end ? dayjs(`${education.year_end}`) : null}
          onChange={(val) =>
            handleYearChange("year_end", val ? val.year() : null)
          }
          sx={{ width: "100%" }}
        ></DatePicker>
      </Box>
      <TextField
        multiline
        label="List of Majors (Separated by Comma)"
        name="majors"
        onChange={handleChange}
        value={education.majors ? education.majors.join(",") : ""}
        fullWidth
        sx={{ marginTop: "0.75rem" }}
      ></TextField>
      <TextField
        multiline
        label="List of Minors (Separated by Comma)"
        name="minors"
        onChange={handleChange}
        value={education.minors ? education.minors.join(",") : ""}
        fullWidth
        sx={{ marginTop: "0.75rem" }}
      ></TextField>
      <TextField
        multiline
        label="List of Awards (Separated by Comma)"
        name="awards"
        onChange={handleChange}
        value={education.awards ? education.awards.join(",") : ""}
        fullWidth
        sx={{ marginTop: "0.75rem" }}
      ></TextField>
      <Button
        type="submit"
        variant="contained"
        color="primary"
        sx={{ mt: 3 }}
        onClick={handleSubmit}
        fullWidth
      >
        Add Education
      </Button>
    </form>
  );
}
