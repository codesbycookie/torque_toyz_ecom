"use client";

import DataTable from "@/components/ui/datatable";
import { useApi } from "@/core/contexts/api.context";
import { useLoader } from "@/core/hooks/useLoader";
import paginator from "@/core/utils/paginate.util";
import sorter from "@/core/utils/sorter.util";
import { useEffect } from "react";

export default function Payment() {
  const { payments } = useApi();
  const { usePaymentColumns, state } = payments;
  const { load } = useLoader();

  const columns = usePaymentColumns(payments);

  const filterOptions = [
    { label: "A - Z", action: () => payments.filters.ascending("razorpay_order_id") },
    { label: "Z - A", action: () => payments.filters.descending("razorpay_order_id") },
  ];

  useEffect(() => {
    load(payments);
  }, []);

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
      filters={filterOptions}
      onPaginationChange={(p) => paginator(payments, p)}
      onSortChange={(p) => sorter(payments, p)}
    />
  );
}