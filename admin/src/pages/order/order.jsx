import DataTable from "@/components/ui/datatable";
import { useApi } from "../../core/contexts/api.context";
import { useLoader } from "@/core/hooks/useLoader";
import paginator from "@/core/utils/paginate.util";
import sorter from "@/core/utils/sorter.util";
import { useEffect, useMemo } from "react";

export default function Order() {
  const { order } = useApi();
  const { useOrderColumns, state } = order;
  const { load } = useLoader();

  const columns = useOrderColumns(order);

  useEffect(() => {
    load(order);
  }, []);

  const customs = useMemo(
    () => [
      {
        title: "Status",
        filters: [
          { label: "Placed", action: () => order.fetch({ status: "placed", page: 1 }) },
          { label: "Confirmed", action: () => order.fetch({ status: "confirmed", page: 1 }) },
          { label: "Shipped", action: () => order.fetch({ status: "shipped", page: 1 }) },
          { label: "Delivered", action: () => order.fetch({ status: "delivered", page: 1 }) },
          { label: "Cancelled", action: () => order.fetch({ status: "cancelled", page: 1 }) },
          {
            label: "Needs Refund",
            action: () =>
              order.fetch({
                status: "cancelled",
                "payment.status": "paid",
                page: 1,
              }),
          },
        ],
      },
      {
        title: "Sort",
        filters: [
          { label: "Latest Placed", action: () => order.sortByColumn("createdAt", "desc") },
          { label: "Oldest Placed", action: () => order.sortByColumn("createdAt", "asc") },
          { label: "Order Code (A-Z)", action: () => order.sortByColumn("code", "asc") },
          { label: "Order Code (Z-A)", action: () => order.sortByColumn("code", "desc") },
          { label: "Status (A-Z)", action: () => order.sortByColumn("status", "asc") },
          { label: "Status (Z-A)", action: () => order.sortByColumn("status", "desc") },
        ],
      },
    ],
    [order]
  );

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
      customs={customs}
      onPaginationChange={(p) => paginator(order, p)}
      onSortChange={(p) => sorter(order, p)}
    />
  );
}
