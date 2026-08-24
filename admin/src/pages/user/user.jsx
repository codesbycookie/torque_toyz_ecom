import DataTable from "@/components/ui/datatable";
import { useApi } from "@/core/contexts/api.context";
import { useLoader } from "@/core/hooks/useLoader";
import paginator from "@/core/utils/paginate.util";
import sorter from "@/core/utils/sorter.util";
import { useEffect } from "react";

export default function User() {
  const { users } = useApi();
  const { useUserColumns, state } = users;
  const { load } = useLoader();

  const columns = useUserColumns(users);

  const filterOptions = [
    { label: "A - Z", action: () => users.filters.ascending("name") },
    { label: "Z - A", action: () => users.filters.descending("name") },
  ];

  useEffect(() => {
    load(users);
  }, []);

  return (
    <DataTable
      data={state}
      columns={columns}
      searchKey={"name"}
      manualPagination={true}
      reset={users.reset}
      loading={users.loading.getAll}
      page={users.pagination.page}
      limit={users.pagination.limit}
      pageCount={users.pagination.pages}
      totalRows={users.pagination.total}
      filters={filterOptions}
      onPaginationChange={(p) => paginator(users, p)}
      onSortChange={(p) => sorter(users, p)}
    />
  );
}