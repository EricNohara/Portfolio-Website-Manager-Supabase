"use client";

import PageContentHeader from "@/app/components/PageContentHeader/PageContentHeader";
import { IButton } from "@/app/components/PageContentHeader/PageContentHeader";
import PageContentWrapper from "@/app/components/PageContentWrapper/PageContentWrapper";
import Table from "@/app/components/Table/Table";
import { useUser } from "@/app/context/UserProvider";

const buttonOne: IButton = {
  name: "Add Experience",
  onClick: () => { }
}

const columns = ["Company", "Title", "Start", "End", "Description"];
const columnWidths = [20, 20, 12.5, 12.5, 35];

export default function WorkExperiencePage() {
  const { state } = useUser();
  const handleEdit = () => { }
  const handleDelete = () => { }

  const rows = state.experiences.map((experience) => ({
    "Company": experience.company,
    "Title": experience.job_title,
    "Start": experience.date_start,
    "End": experience.date_end,
    "Description": experience.job_description,
  }));

  return (
    <PageContentWrapper>
      <PageContentHeader title="Work Experiences" buttonOne={buttonOne} />
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
