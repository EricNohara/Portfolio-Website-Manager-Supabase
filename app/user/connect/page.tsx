"use client";

import { RefreshCcw } from "lucide-react";

import PageContentHeader from "@/app/components/PageContentHeader/PageContentHeader";
import { IButton } from "@/app/components/PageContentHeader/PageContentHeader";
import PageContentWrapper from "@/app/components/PageContentWrapper/PageContentWrapper";
import Table from "@/app/components/Table/Table";
import { useUser } from "@/app/context/UserProvider";


const buttonOne: IButton = {
  name: "Generate API Key",
  onClick: () => { }
}

const buttonTwo: IButton = {
  name: "API Docs",
  onClick: () => { }
}

const columns = ["Description", "Created", "Expires", "Last Used"];
const columnWidths = [40, 20, 20, 20];

export default function ConnectPage() {
  const { state } = useUser();
  const handleEdit = () => { }
  const handleDelete = () => { }

  // const rows = state.education.map((education) => ({
  //   "Institution": education.institution,
  //   "Degree": education.degree,
  //   "Majors": education.majors.join(", "),
  //   "Minors": education.minors.join(", "),
  //   "GPA": education.gpa,
  //   "Start": education.year_start,
  //   "End": education.year_end,
  //   "Awards": education.awards.join(", "),
  //   "Courses": <a><ExternalLink /></a>
  // }));

  return (
    <PageContentWrapper>
      <PageContentHeader title="Education" buttonOne={buttonOne} />
      {/* <Table
        columns={columns}
        rows={rows}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        columnWidths={columnWidths}
      /> */}
    </PageContentWrapper>
  );
}
