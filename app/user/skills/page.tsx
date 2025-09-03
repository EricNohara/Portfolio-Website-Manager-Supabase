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
  const [formValues, setFormValues] = useState({
    name: "",
    proficiency: "",
    years_of_experience: ""
  });

  const handleEdit = () => { }
  const handleDelete = () => { }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const name = formValues.name.trim();
    const proficiency = Number(formValues.proficiency.trim());
    const years_of_experience = Number(formValues.years_of_experience.trim());

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

    // add the skill
    try {
      const res = await fetch("/api/internal/user/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSkill),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
    } catch (err) {
      console.error(err);
      const error = err as Error;
      alert(error.message);
    }

    // update the cached user
    dispatch({ type: "ADD_SKILL", payload: newSkill });

    // reset form
    setFormValues({
      name: "",
      proficiency: "",
      years_of_experience: ""
    });

    // close the form
    setIsFormOpen(false);
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
        value: formValues.proficiency
      },
      inputTwo: {
        label: "Years of Experience",
        name: "years_of_experience",
        type: "number",
        placeholder: "Enter years of experience",
        required: false,
        onChange: handleChange,
        value: formValues.years_of_experience
      }
    }
  ]

  const formProps: IInputFormProps = {
    title: "Add Skill Information",
    buttonLabel: "Add Skill",
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
