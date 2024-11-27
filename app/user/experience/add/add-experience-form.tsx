"use client";

import { useState, useEffect } from "react";
import { Button, TextField, Box } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";

interface IExperience {
  company: string;
  job_title: string;
  date_start: string | null;
  date_end: string | null;
  job_description: string | null;
}

export default function AddExperienceForm() {
  const [user, setUser] = useState(null);
  const [experience, setExperience] = useState<IExperience>({
    company: "",
    job_title: "",
    date_start: null,
    date_end: null,
    job_description: null,
  });

  useEffect(() => {
    const authenticator = async () => {
      const res = await fetch("/api/auth/authenticated", { method: "GET" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      setUser(data.user);
    };

    authenticator();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setExperience((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleDateChange = (field: string, value: Dayjs | null) => {
    setExperience((prevData) => ({
      ...prevData,
      [field]: value ? value.format("YYYY-MM-DD") : null, // Convert Dayjs to Date or store null
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    console.log(experience);
  };

  return (
    <form>
      <TextField
        label="Company"
        name="company"
        onChange={handleChange}
        fullWidth
        margin="dense"
        size="medium"
        value={experience.company}
        required
      ></TextField>
      <TextField
        label="Job Title"
        name="job_title"
        onChange={handleChange}
        fullWidth
        margin="dense"
        size="medium"
        value={experience.job_title}
        required
      ></TextField>
      <Box display="flex" gap="2%" marginTop="0.5rem">
        <DatePicker
          label="Start Date"
          name="date_start"
          value={experience.date_start ? dayjs(experience.date_start) : null}
          onChange={(val) => handleDateChange("date_start", val)}
        ></DatePicker>
        <DatePicker
          label="End Date"
          name="date_end"
          value={experience.date_end ? dayjs(experience.date_end) : null}
          onChange={(val) => handleDateChange("date_end", val)}
        ></DatePicker>
      </Box>
      <TextField
        multiline
        label="Job Description"
        name="job_description"
        value={experience.job_description}
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
        Add Experience
      </Button>
    </form>
  );
}
