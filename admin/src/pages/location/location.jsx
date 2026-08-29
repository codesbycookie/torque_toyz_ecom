import DataTable from "@/components/ui/datatable";
import { useApi } from "../../core/contexts/api.context";
import { useLoader } from "@/core/hooks/useLoader";
import { createbtn } from "@/core/utils/datatable.helper.util";
import paginator from "@/core/utils/paginate.util";
import sorter from "@/core/utils/sorter.util";
import { useEffect } from "react";

export default function Location() {
  const { locations } = useApi();
  const { useLocationColumns, state } = locations;
  const { load } = useLoader();

  const columns = useLocationColumns(locations);

  const filterOptions = [
    { label: "Latest", action: locations.filters.latest },
    { label: "Oldest", action: locations.filters.oldest },
    { label: "A - Z", action: () => locations.filters.ascending("state") },
    { label: "Z - A", action: () => locations.filters.descending("state") },
  ];

  useEffect(() => {
    load(locations);
  }, []);

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
      filters={filterOptions}
      onPaginationChange={(p) => paginator(locations, p)}
      onSortChange={(p) => sorter(locations, p)}
    />
  );
}