import DataTable from "@/components/ui/datatable";
import { useApi } from "../../core/contexts/api.context";
import { useLoader } from "@/core/hooks/useLoader";
import { createbtn } from "@/core/utils/datatable.helper.util";
import paginator from "@/core/utils/paginate.util";
import sorter from "@/core/utils/sorter.util";
import { useEffect, useMemo } from "react";

export default function Product() {
  const { products, categories, settings } = useApi();
  const { useProductColumns, state } = products;
  const { load } = useLoader();

  const lowStockThreshold = Number(settings?.current?.low_stock_threshold ?? 10);
  const columns = useProductColumns(products, { lowStockThreshold });

  useEffect(() => {
    load(products);
    if (categories?.crud?.getAll) {
      load(categories);
    }
    if (settings?.fetch) {
      settings.fetch();
    }
  }, []);

  const customs = useMemo(() => {
    const list = [
      {
        title: "Status",
        filters: [
          { label: "Active Products", action: () => products.fetch({ active: true, page: 1 }) },
          { label: "Inactive Products", action: () => products.fetch({ active: false, page: 1 }) },
        ],
      },
      {
        title: "Stock",
        filters: [
          {
            label: "Need More Stock",
            action: () => products.fetch({ lowStock: true, page: 1 }),
          },
          {
            label: "In Stock",
            action: () => products.fetch({ inStock: true, page: 1 }),
          },
        ],
      },
    ];

    if (categories?.state?.length) {
      list.push({
        title: "Category",
        filters: categories.state.map((cat) => ({
          label: cat.name,
          action: () => products.fetch({ category: cat._id, page: 1 }),
        })),
      });
    }

    list.push({
      title: "Sort",
      filters: [
        { label: "Name (A-Z)", action: () => products.sortByColumn("name", "asc") },
        { label: "Name (Z-A)", action: () => products.sortByColumn("name", "desc") },
        { label: "Price: Low to High", action: () => products.sortByColumn("price", "asc") },
        { label: "Price: High to Low", action: () => products.sortByColumn("price", "desc") },
        { label: "Stock: Low to High", action: () => products.sortByColumn("stock", "asc") },
        { label: "Stock: High to Low", action: () => products.sortByColumn("stock", "desc") },
        { label: "Weight: Low to High", action: () => products.sortByColumn("weight", "asc") },
        { label: "Weight: High to Low", action: () => products.sortByColumn("weight", "desc") },
        { label: "Product Code (A-Z)", action: () => products.sortByColumn("code", "asc") },
        { label: "Latest Created", action: () => products.sortByColumn("createdAt", "desc") },
        { label: "Oldest Created", action: () => products.sortByColumn("createdAt", "asc") },
      ],
    });

    return list;
  }, [products, categories?.state]);

  return (
    <DataTable
      data={state}
      columns={columns}
      searchKey={"name"}
      create={createbtn("Create Product", () => products.openCreate(), true)}
      manualPagination={true}
      reset={products.reset}
      loading={products.loading.getAll}
      page={products.pagination.page}
      limit={products.pagination.limit}
      pageCount={products.pagination.pages}
      totalRows={products.pagination.total}
      customs={customs}
      onPaginationChange={(p) => paginator(products, p)}
      onSortChange={(p) => sorter(products, p)}
    />
  );
}
