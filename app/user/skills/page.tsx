"use client";

import PageContentWrapper from "@/app/components/PageContentWrapper/PageContentWrapper";
import Table from "@/app/components/Table/Table";
import { useUser } from "@/app/context/UserProvider";

import PageContentHeader from "../../components/PageContentHeader/PageContentHeader";
import { IButton } from "../../components/PageContentHeader/PageContentHeader";

const buttonOne: IButton = {
  name: "Add Skill",
  onClick: () => { }
}

const columns = ["Name", "Proficiency", "Years of Experience"];
const columnWidths = [50, 25, 25];

export default function WorkExperiencePage() {
  const { state } = useUser();
  const handleEdit = () => { }
  const handleDelete = () => { }

  const rows = state.skills.map((skill) => ({
    "Name": skill.name,
    "Proficiency": skill.proficiency,
    "Years of Experience": skill.years_of_experience
  }));

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
    </PageContentWrapper>
  );
}
