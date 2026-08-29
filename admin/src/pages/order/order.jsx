import DataTable from "@/components/ui/datatable";
import { useApi } from "../../core/contexts/api.context";
import { useLoader } from "@/core/hooks/useLoader";
import paginator from "@/core/utils/paginate.util";
import sorter from "@/core/utils/sorter.util";
import { useEffect } from "react";

export default function Order() {
  const { order } = useApi();
  const { useOrderColumns, state } = order;
  const { load } = useLoader();

  const columns = useOrderColumns(order);

  const filterOptions = [
    { label: "Latest", action: order.filters.latest },
    { label: "Oldest", action: order.filters.oldest },
  ];

  useEffect(() => {
    load(order);
  }, []);

  return (
    <DataTable
      data={state}
      columns={columns}
      searchKey={"code"}
      manualPagination={true}
      reset={order.reset}
      loading={order.loading.getAll}
      page={order.pagination.page}
      limit={order.pagination.limit}
      pageCount={order.pagination.pages}
      totalRows={order.pagination.total}
      filters={filterOptions}
      onPaginationChange={(p) => paginator(order, p)}
      onSortChange={(p) => sorter(order, p)}
    />
  );
}