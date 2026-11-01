"use client";

import DataTable from "@/components/ui/datatable";
import { useApi } from "@/core/contexts/api.context";
import { useLoader } from "@/core/hooks/useLoader";
import paginator from "@/core/utils/paginate.util";
import sorter from "@/core/utils/sorter.util";
import { useEffect, useMemo } from "react";

export default function Payment() {
  const { payments } = useApi();
  const { usePaymentColumns, state } = payments;
  const { load } = useLoader();

  const columns = usePaymentColumns(payments);

  useEffect(() => {
    load(payments);
  }, []);

  const customs = useMemo(
    () => [
      {
        title: "Status",
        filters: [
          { label: "Paid", action: () => payments.fetch({ status: "paid", page: 1 }) },
          { label: "Created (Pending)", action: () => payments.fetch({ status: "created", page: 1 }) },
          { label: "Failed", action: () => payments.fetch({ status: "failed", page: 1 }) },
          { label: "Refunded", action: () => payments.fetch({ status: "refunded", page: 1 }) },
        ],
      },
      {
        title: "Sort",
        filters: [
          { label: "Latest Created", action: () => payments.sortByColumn("createdAt", "desc") },
          { label: "Oldest Created", action: () => payments.sortByColumn("createdAt", "asc") },
          { label: "Amount: High to Low", action: () => payments.sortByColumn("amount", "desc") },
          { label: "Amount: Low to High", action: () => payments.sortByColumn("amount", "asc") },
          { label: "Razorpay Order (A-Z)", action: () => payments.sortByColumn("razorpay_order_id", "asc") },
          { label: "Razorpay Order (Z-A)", action: () => payments.sortByColumn("razorpay_order_id", "desc") },
          { label: "Status (A-Z)", action: () => payments.sortByColumn("status", "asc") },
        ],
      },
    ],
    [payments]
  );

  return (
    <DataTable
      data={state}
      columns={columns}
      searchKey="razorpay_order_id"
      manualPagination={true}
      reset={payments.reset}
      loading={payments.loading.getAll}
      page={payments.pagination.page}
      limit={payments.pagination.limit}
      pageCount={payments.pagination.pages}
      totalRows={payments.pagination.total}
      customs={customs}
      onPaginationChange={(p) => paginator(payments, p)}
      onSortChange={(p) => sorter(payments, p)}
    />
  );
}
