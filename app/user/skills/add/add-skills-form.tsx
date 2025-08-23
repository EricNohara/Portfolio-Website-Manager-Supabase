"use client";

import { Button, TextField } from "@mui/material";
import { useState } from "react";

import { ISkillsInput } from "@/app/interfaces/ISkills";

export default function AddSkillsForm() {
  const [skill, setSkill] = useState<ISkillsInput>({
    name: "",
    proficiency: null,
    years_of_experience: null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let val = value;

    if (name === "proficiency") {
      if (parseInt(value) < 0) val = "0";
      else if (parseInt(value) > 10) val = "10";
    } else if (name === "years_of_experience") {
      if (parseInt(value) < 0) val = "0";
      else if (parseInt(value) > 100) val = "100";
    }

    setSkill((prevData) => ({
      ...prevData,
      [name]: val,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!skill.name.trim()) {
      alert("Please fill out all required fields.");
      return;
    }

    try {
      const res = await fetch("/api/internal/user/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(skill),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);
      alert(data.message);
      setSkill({ name: "", proficiency: null, years_of_experience: null });
    } catch (err) {
      alert(err);
    }
  };

  return (
    <form>
      <TextField
        label="Skill Name"
        name="name"
        onChange={handleChange}
        fullWidth
        margin="dense"
        size="medium"
        value={skill.name}
        required
      ></TextField>
      <TextField
        label="Skill Proficiency Out of 10"
        name="proficiency"
        type="number"
        onChange={handleChange}
        fullWidth
        margin="dense"
        size="medium"
        value={skill.proficiency || ""}
      ></TextField>
      <TextField
        label="Years of Experience"
        name="years_of_experience"
        type="number"
        onChange={handleChange}
        fullWidth
        margin="dense"
        size="medium"
        value={skill.years_of_experience || ""}
      ></TextField>
      <Button
        type="submit"
        variant="contained"
        color="primary"
        sx={{ mt: 3 }}
        onClick={handleSubmit}
        fullWidth
      >
        Add Skill
      </Button>
    </form>
  );
}
