import DataTable from "@/components/ui/datatable";
import { useApi } from "@/core/contexts/api.context";
import { useLoader } from "@/core/hooks/useLoader";
import { createbtn } from "@/core/utils/datatable.helper.util";
import paginator from "@/core/utils/paginate.util";
import sorter from "@/core/utils/sorter.util";
import { useEffect } from "react";

export default function Category() {
  const { categories } = useApi();
  const { useCategoryColumns, state } = categories;
  const { load } = useLoader();

  const columns = useCategoryColumns(categories);

  const filterOptions = [
    { label: "Latest", action: categories.filters.latest },
    { label: "Oldest", action: categories.filters.oldest },
    { label: "A - Z", action: () => categories.filters.ascending("name") },
    { label: "Z - A", action: () => categories.filters.descending("name") },
  ];

  useEffect(() => {
    load(categories);
  }, []);

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
      filters={filterOptions}
      onPaginationChange={(p) => paginator(categories, p)}
      onSortChange={(p) => sorter(categories, p)}
    />
  );
}