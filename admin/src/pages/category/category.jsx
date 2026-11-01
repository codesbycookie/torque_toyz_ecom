import DataTable from "@/components/ui/datatable";
import { useApi } from "@/core/contexts/api.context";
import { useLoader } from "@/core/hooks/useLoader";
import { createbtn } from "@/core/utils/datatable.helper.util";
import paginator from "@/core/utils/paginate.util";
import sorter from "@/core/utils/sorter.util";
import { useEffect, useMemo } from "react";

export default function Category() {
  const { categories } = useApi();
  const { useCategoryColumns, state } = categories;
  const { load } = useLoader();

  const columns = useCategoryColumns(categories);

  useEffect(() => {
    load(categories);
  }, []);

  const customs = useMemo(
    () => [
      {
        title: "Status",
        filters: [
          { label: "Active Categories", action: () => categories.fetch({ active: true, page: 1 }) },
          { label: "Inactive Categories", action: () => categories.fetch({ active: false, page: 1 }) },
        ],
      },
      {
        title: "Sort",
        filters: [
          { label: "Name (A-Z)", action: () => categories.sortByColumn("name", "asc") },
          { label: "Name (Z-A)", action: () => categories.sortByColumn("name", "desc") },
          { label: "Latest Created", action: () => categories.sortByColumn("createdAt", "desc") },
          { label: "Oldest Created", action: () => categories.sortByColumn("createdAt", "asc") },
          { label: "Active First", action: () => categories.sortByColumn("active", "desc") },
        ],
      },
    ],
    [categories]
  );

  return (
    <DataTable
      data={state}
      columns={columns}
      searchKey={"name"}
      create={createbtn("Create Category", () => categories.openCreate(), true)}
      manualPagination={true}
      reset={categories.reset}
      loading={categories.loading.getAll}
      page={categories.pagination.page}
      limit={categories.pagination.limit}
      pageCount={categories.pagination.pages}
      totalRows={categories.pagination.total}
      customs={customs}
      onPaginationChange={(p) => paginator(categories, p)}
      onSortChange={(p) => sorter(categories, p)}
    />
  );
}
