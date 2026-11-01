import DataTable from "@/components/ui/datatable";
import { useApi } from "@/core/contexts/api.context";
import { useLoader } from "@/core/hooks/useLoader";
import paginator from "@/core/utils/paginate.util";
import sorter from "@/core/utils/sorter.util";
import { useEffect, useMemo } from "react";

export default function User() {
  const { users } = useApi();
  const { useUserColumns, state } = users;
  const { load } = useLoader();

  const columns = useUserColumns(users);

  useEffect(() => {
    load(users);
  }, []);

  const customs = useMemo(
    () => [
      {
        title: "Role",
        filters: [
          { label: "Customers (Users)", action: () => users.fetch({ role: "user", page: 1 }) },
          { label: "Admins", action: () => users.fetch({ role: "admin", page: 1 }) },
        ],
      },
      {
        title: "Status",
        filters: [
          { label: "Active Accounts", action: () => users.fetch({ active: true, page: 1 }) },
          { label: "Disabled Accounts", action: () => users.fetch({ active: false, page: 1 }) },
        ],
      },
      {
        title: "Sort",
        filters: [
          { label: "Name (A-Z)", action: () => users.sortByColumn("name", "asc") },
          { label: "Name (Z-A)", action: () => users.sortByColumn("name", "desc") },
          { label: "Login ID (A-Z)", action: () => users.sortByColumn("login_id", "asc") },
          { label: "Login ID (Z-A)", action: () => users.sortByColumn("login_id", "desc") },
          { label: "Latest Registered", action: () => users.sortByColumn("createdAt", "desc") },
          { label: "Oldest Registered", action: () => users.sortByColumn("createdAt", "asc") },
          { label: "Active First", action: () => users.sortByColumn("active", "desc") },
        ],
      },
    ],
    [users]
  );

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
      customs={customs}
      onPaginationChange={(p) => paginator(users, p)}
      onSortChange={(p) => sorter(users, p)}
    />
  );
}
