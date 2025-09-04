"use client";

import { useState } from "react";

import InputForm from "@/app/components/InputForm/InputForm";
import { IInputFormRow, IInputFormProps } from "@/app/components/InputForm/InputForm";
import PageContentWrapper from "@/app/components/PageContentWrapper/PageContentWrapper";
import Table from "@/app/components/Table/Table";
import { useUser } from "@/app/context/UserProvider";
import { ISkillsInput } from "@/app/interfaces/ISkills";

import PageContentHeader, { IButton } from "../../components/PageContentHeader/PageContentHeader";



const columns = ["Name", "Proficiency", "Years of Experience"];
const columnWidths = [50, 25, 25];

export default function WorkExperiencePage() {
  const { state, dispatch } = useUser();
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [formValues, setFormValues] = useState<ISkillsInput>({
    name: "",
    proficiency: null,
    years_of_experience: null
  });
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingSkill, setEditingSkill] = useState<ISkillsInput | null>(null);

  const handleEdit = (rowIndex: number) => {
    const skill = state.skills[rowIndex];
    setEditingSkill(skill);
    setFormValues({
      name: skill.name,
      proficiency: skill.proficiency,
      years_of_experience: skill.years_of_experience
    });
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const handleDelete = async (rowIndex: number) => {
    const skill = state.skills[rowIndex];
    try {
      const res = await fetch(`/api/internal/user/skills?skillName=${skill.name}`, { method: "DELETE" });
      if (!res.ok) throw new Error(data.message);

      // update cached state
      dispatch({ type: "DELETE_SKILL", payload: skill });
    } catch (error) {
      console.error(error);
      alert(error);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  // split this into add vs edit later
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const name = formValues.name.trim();
    const proficiency = formValues.proficiency;
    const years_of_experience = formValues.years_of_experience;

    // validate input
    if (!name) {
      alert("Please fill out all required fields.");
      return;
    }

    if (proficiency && (proficiency < 1 || proficiency > 10)) {
      alert("Proficiency must be a number between 1 and 10.")
      return;
    }

    if (years_of_experience && years_of_experience < 0) {
      alert("Years of experience cannot be less than 0.")
      return;
    }

    const newSkill: ISkillsInput = {
      name: name,
      proficiency: proficiency ? proficiency : null,
      years_of_experience: years_of_experience ? years_of_experience : null
    }

    try {
      if (isEditing && editingSkill) {
        // update the skill
        const editPayload = {
          skillName: editingSkill.name,
          updatedSkill: newSkill
        }
        const res = await fetch("/api/internal/user/skills", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editPayload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        // update cached state
        dispatch({ type: "UPDATE_SKILL", payload: { old: editingSkill, new: newSkill } });
      } else {
        // Add the skill
        const res = await fetch("/api/internal/user/skills", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newSkill),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        // update the cached user
        dispatch({ type: "ADD_SKILL", payload: newSkill });
      }

    } catch (err) {
      console.error(err);
      const error = err as Error;
      alert(error.message);
    }

    // reset form
    setFormValues({ name: "", proficiency: null, years_of_experience: null });
    setIsFormOpen(false);
    setIsEditing(false);
    setEditingSkill(null);
  }

  const onClose = () => {
    setIsFormOpen(false);
  }

  const buttonOne: IButton = {
    name: "Add Skill",
    onClick: () => setIsFormOpen(true)
  }

  const rows = state.skills.map((skill) => ({
    "Name": skill.name,
    "Proficiency": skill.proficiency,
    "Years of Experience": skill.years_of_experience
  }));

  const inputRows: IInputFormRow[] = [
    {
      inputOne: {
        label: "Skill Name",
        name: "name",
        type: "text",
        placeholder: "Enter skill name",
        required: true,
        onChange: handleChange,
        value: formValues.name
      }
    }, {
      inputOne: {
        label: "Skill Proficiency (1 - 10)",
        name: "proficiency",
        type: "number",
        placeholder: "Enter skill proficiency",
        required: false,
        onChange: handleChange,
        value: formValues.proficiency ? `${formValues.proficiency}` : ""
      },
      inputTwo: {
        label: "Years of Experience",
        name: "years_of_experience",
        type: "number",
        placeholder: "Enter years of experience",
        required: false,
        onChange: handleChange,
        value: formValues.years_of_experience ? `${formValues.years_of_experience}` : ""
      }
    }
  ]

  const formProps: IInputFormProps = {
    title: isEditing ? "Edit Skill Information" : "Add Skill Information",
    buttonLabel: isEditing ? "Save Changes" : "Add Skill",
    onSubmit: onSubmit,
    inputRows: inputRows,
    onClose: onClose
  }

  return (
    <PageContentWrapper>
      <PageContentHeader title="Skills" buttonOne={buttonOne} />
      <Table
        columns={columns}
        rows={rows}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        columnWidths={columnWidths}
      />

      {
        isFormOpen &&
        <InputForm
          title={formProps.title}
          buttonLabel={formProps.buttonLabel}
          onSubmit={formProps.onSubmit}
          inputRows={formProps.inputRows}
          onClose={formProps.onClose}
        />
      }
    </PageContentWrapper>
  );
}
