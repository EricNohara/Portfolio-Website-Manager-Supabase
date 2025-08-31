"use client";

import PageContentWrapper from "@/app/components/PageContentWrapper/PageContentWrapper";
import Table from "@/app/components/Table/Table";
import { useUser } from "@/app/context/UserProvider";
import PageContentHeader from "@/app/components/PageContentHeader/PageContentHeader";
import { IButton } from "@/app/components/PageContentHeader/PageContentHeader";

const buttonOne: IButton = {
  name: "Add Education",
  onClick: () => { }
}

const columns = ["Institution", "Degree", "Majors", "Minors", "GPA", "Start", "End", "Awards", "Courses"];
const columnWidths = [20, 20, 15, 15, 5, 5, 5, 10, 5];

export default function EducationPage() {
  const { state } = useUser();
  const handleEdit = () => { }
  const handleDelete = () => { }

  const rows = state.education.map((education) => ({
    "Institution": education.institution,
    "Degree": education.degree,
    "Majors": education.majors.join(", "),
    "Minors": education.minors.join(", "),
    "GPA": education.gpa,
    "Start": education.year_start,
    "End": education.year_end,
    "Awards": education.awards.join(", "),
    "Courses": education.courses.length, // edit this to link to courses page later
  }));

  return (
    <PageContentWrapper>
      <PageContentHeader title="Education" buttonOne={buttonOne} />
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
