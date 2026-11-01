import DataTable from "@/components/ui/datatable";
import { useApi } from "../../core/contexts/api.context";
import { useLoader } from "@/core/hooks/useLoader";
import { createbtn } from "@/core/utils/datatable.helper.util";
import paginator from "@/core/utils/paginate.util";
import sorter from "@/core/utils/sorter.util";
import { useEffect, useMemo } from "react";

export default function Location() {
  const { locations } = useApi();
  const { useLocationColumns, state } = locations;
  const { load } = useLoader();

  const columns = useLocationColumns(locations);

  useEffect(() => {
    load(locations);
  }, []);

  const customs = useMemo(
    () => [
      {
        title: "Deliverability",
        filters: [
          { label: "Deliverable Only", action: () => locations.fetch({ deliverable: true, page: 1 }) },
          { label: "Non-Deliverable", action: () => locations.fetch({ deliverable: false, page: 1 }) },
        ],
      },
      {
        title: "Sort",
        filters: [
          { label: "State Name (A-Z)", action: () => locations.sortByColumn("state", "asc") },
          { label: "State Name (Z-A)", action: () => locations.sortByColumn("state", "desc") },
          { label: "State Code (A-Z)", action: () => locations.sortByColumn("code", "asc") },
          { label: "State Code (Z-A)", action: () => locations.sortByColumn("code", "desc") },
          { label: "Latest Created", action: () => locations.sortByColumn("createdAt", "desc") },
          { label: "Oldest Created", action: () => locations.sortByColumn("createdAt", "asc") },
        ],
      },
    ],
    [locations]
  );

  return (
    <DataTable
      data={state}
      columns={columns}
      searchKey={"state"}
      create={createbtn("Create Location", () => locations.openCreate(), true)}
      manualPagination={true}
      reset={locations.reset}
      loading={locations.loading.getAll}
      page={locations.pagination.page}
      limit={locations.pagination.limit}
      pageCount={locations.pagination.pages}
      totalRows={locations.pagination.total}
      customs={customs}
      onPaginationChange={(p) => paginator(locations, p)}
      onSortChange={(p) => sorter(locations, p)}
    />
  );
}
