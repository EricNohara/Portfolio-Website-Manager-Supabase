"use client";

import { useState } from "react";

import InputForm from "@/app/components/InputForm/InputForm";
import { IInputFormRow, IInputFormProps } from "@/app/components/InputForm/InputForm";
import PageContentWrapper from "@/app/components/PageContentWrapper/PageContentWrapper";
import Table from "@/app/components/Table/Table";
import { useUser } from "@/app/context/UserProvider";

import PageContentHeader, { IButton } from "../../components/PageContentHeader/PageContentHeader";


const columns = ["Name", "Proficiency", "Years of Experience"];
const columnWidths = [50, 25, 25];

export default function WorkExperiencePage() {
  const { state } = useUser();
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

  const handleSubmit = () => {
    console.log("Submitting:", formValues);
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
    handleSubmit: handleSubmit,
    inputRows: inputRows
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
          handleSubmit={formProps.handleSubmit}
          inputRows={formProps.inputRows}
        />
      }
    </PageContentWrapper>
  );
}
