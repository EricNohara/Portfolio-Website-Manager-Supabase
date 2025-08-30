"use client";

import PageContentWrapper from "@/app/components/PageContentWrapper/PageContentWrapper";
import Table from "@/app/components/Table/Table";

// import SkillsList from "./skills-list";
import PageContentHeader from "../../components/PageContentHeader/PageContentHeader";
import { IButton } from "../../components/PageContentHeader/PageContentHeader";

const buttonOne: IButton = {
  name: "Add Skill",
  onClick: () => { }
}

export default function WorkExperiencePage() {
  const columns = ["Name", "Proficiency", "Years of Experience"];
  const handleEdit = () => { }
  const handleDelete = () => { }

  return (
    <PageContentWrapper>
      <PageContentHeader title="Skills" buttonOne={buttonOne} />
      <Table columns={columns} rows={[]} handleEdit={handleEdit} handleDelete={handleDelete} />
      {/* <SkillsList /> */}
    </PageContentWrapper>
  );
}
