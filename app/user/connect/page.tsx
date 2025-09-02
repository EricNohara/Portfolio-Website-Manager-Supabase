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

const columns = ["Description", "Created", "Expires"];
// const columns = ["Description", "Created", "Expires", "Last Used"];
const columnWidths = [50, 25, 25];
// const columnWidths = [40, 20, 20, 20];

export default function ConnectPage() {
  const { state } = useUser();
  const handleEdit = () => { }
  const handleDelete = () => { }

  const rows = state.api_keys.map((key) => ({
    "Description": key.description,
    "Created": key.created,
    "Expires": key.expires ? key.expires : "Never",
    // "Last Used": key.,
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
