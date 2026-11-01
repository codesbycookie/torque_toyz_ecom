import mongoose, { Model, Document, PipelineStage, Types } from "mongoose";
import { analyzeSchemaPaths } from "@utils/schemaanalyzer.util.ts";
import { castObjectIds } from "@core/utils/parseid.util.ts";

export interface SearchableRefConfig {
  field: string; // local field holding the ObjectId, e.g. 'branch'
  ref: string; // model name registered with mongoose, e.g. 'Branch'
  matchOn: string; // field on the referenced model to regex-match, e.g. 'name'
}

export interface FilterConfig<T> {
  searchable?: (keyof T | string)[];
  searchableRefs?: SearchableRefConfig[];
  filterable?: (keyof T | string)[];
  sortable?: (keyof T | string)[];
  defaultSort?: keyof T | string;
  extras?: {
    select?: string;
  };
  forcePopulate?: any[];
  populate?: any[];
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export async function dynamicFilter<T extends Document>(
  model: Model<T>,
  config: FilterConfig<T>,
  queryParams: Record<string, any>,
  options: PaginationOptions & {
    extras?: {
      select?: string;
    };
    nestedPopulate?: any[];
    forcePopulate?: any[];
    visibility?: "all" | "active-only";
    rawQuery?: Record<string, any>;
  } = {},
): Promise<PaginatedResult<T>> {
  mongoose.set("strictPopulate", false);
  const {
    searchable = [],
    filterable = [],
    sortable = [],
    searchableRefs = [],
    defaultSort = "createdAt",
  } = config;

  const { populatePaths, refIdPaths, dynamicRefPaths } = analyzeSchemaPaths(
    model.schema,
  );
  const dynamicRefPathSet = new Set(dynamicRefPaths.map((d) => d.path));

  const query: Record<string, any> = {};

  const visibility = options.visibility ?? "active-only";
  const SMART_SORT_FIELDS = ["name"];
  const BUSINESS_SORT_FIELDS: any = {};
  const DERIVED_SORT_FIELDS: any = {};

  if (visibility === "active-only") {
    if (model.schema.path("active")) query.active = true;
    if (model.schema.path("deleted")) query.deleted = false;
  }

  const isFullFetch = queryParams.full === "true" || queryParams.full === true;

  const rawQuery = (options as any).rawQuery ?? {};
  Object.assign(query, rawQuery);

  castObjectIds(query);

  filterable.forEach((field) => {
    const key = field as string;
    const value = queryParams[key];
    if (!value) return;

    const isId = Types.ObjectId.isValid(value);

    if (refIdPaths.includes(key)) {
      query[key] = isId ? new Types.ObjectId(value) : value;
      return;
    }

    if (isId) {
      query[key] = new Types.ObjectId(value);
      return;
    }

    if (key.toLowerCase().includes("date")) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) query[key] = d;
      return;
    }

    if (value === "true" || value === "false") {
      query[key] = value === "true";
      return;
    }

    query[key] = value;
  });

  const lookupStages: PipelineStage[] = [];
  const searchUnsetFields: string[] = [];

  if (
    queryParams.search &&
    (searchable.length > 0 || searchableRefs.length > 0)
  ) {
    const r = new RegExp(queryParams.search.trim(), "i");
    const orConditions: Record<string, any>[] = searchable.map((f) => ({
      [f]: { $regex: r },
    }));

    searchableRefs.forEach(({ field, ref, matchOn }) => {
      const refModel = mongoose.model(ref);
      const alias = `__search_${field.replace(/\./g, "_")}`;

      lookupStages.push({
        $lookup: {
          from: refModel.collection.name,
          localField: field,
          foreignField: "_id",
          as: alias,
        },
      });

      searchUnsetFields.push(alias);
      orConditions.push({ [`${alias}.${matchOn}`]: { $regex: r } });
    });

    query.$or = orConditions;
  }

  const sort: Record<string, 1 | -1> = { createdAt: -1 };
  const sortBy = queryParams.sortBy;

  if (sortBy && sortable.includes(sortBy)) {
    sort[sortBy] = queryParams.order === "asc" ? 1 : -1;
  } else {
    sort[defaultSort as string] = 1;
  }

  const page = isFullFetch ? 1 : Math.max(1, Number(queryParams.page) || 1);
  const limit = isFullFetch
    ? 0
    : Math.min(100, Math.max(1, Number(queryParams.limit) || 10));

  const sortField = Object.keys(sort)[0];
  const sortOrder = sort[sortField];

  const pipeline: PipelineStage[] = [...lookupStages, { $match: query }];

  if (DERIVED_SORT_FIELDS[sortField]) {
    const derived = DERIVED_SORT_FIELDS[sortField];
    pipeline.push({
      $sort: {
        [derived.field]: sortOrder,
        createdAt: -1,
      },
    });
  } else if (BUSINESS_SORT_FIELDS[sortField]) {
    const map = BUSINESS_SORT_FIELDS[sortField];

    pipeline.push(
      {
        $addFields: {
          __businessOrder: {
            $switch: {
              branches: Object.entries(map).map(([key, value]) => ({
                case: { $eq: [`$${sortField}`, key] },
                then: value,
              })),
              default: 999,
            },
          },
        },
      },
      {
        $sort: {
          __businessOrder: sortOrder,
          createdAt: -1,
        },
      },
      {
        $project: {
          __businessOrder: 0,
        },
      },
    );
  } else if (SMART_SORT_FIELDS.includes(sortField)) {
    pipeline.push(
      {
        $addFields: {
          __cleanValue: {
            $toLower: {
              $trim: { input: { $toString: `$${sortField}` } },
            },
          },

          __typePriority: {
            $cond: [
              {
                $regexMatch: {
                  input: "$__cleanValue",
                  regex: /^[a-z]+$/,
                },
              },
              0,
              1,
            ],
          },

          __numericPart: {
            $let: {
              vars: {
                match: {
                  $regexFind: {
                    input: "$__cleanValue",
                    regex: /\d+/,
                  },
                },
              },
              in: {
                $cond: [
                  { $ne: ["$$match", null] },
                  { $toInt: "$$match.match" },
                  999999,
                ],
              },
            },
          },
        },
      },
      {
        $sort: {
          __typePriority: 1,
          __numericPart: 1,
          __cleanValue: sortOrder,
        },
      },
      {
        $project: {
          __cleanValue: 0,
          __typePriority: 0,
          __numericPart: 0,
        },
      },
    );
  } else {
    pipeline.push({ $sort: sort });
  }

  pipeline.push({
    $project: {
      password: 0,
      __v: 0,
      ...Object.fromEntries(searchUnsetFields.map((f) => [f, 0])),
    },
  });

  let data: any[];
  let total: number;

  if (isFullFetch) {
    data = await model.aggregate(pipeline);
    total = data.length;
  } else {
    const [result] = await model.aggregate([
      ...pipeline,
      {
        $facet: {
          data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
          total: [{ $count: "count" }],
        },
      },
    ]);

    data = result?.data ?? [];
    total = result?.total?.[0]?.count ?? 0;
  }

  if (populatePaths.length > 0) {
    data = await model.populate(
      data,
      populatePaths.map((path) => {
        if (dynamicRefPathSet.has(path)) {
          return { path };
        }

        const schemaPath: any = model.schema.path(path);
        let refModelName = null;

        if (schemaPath?.options?.ref) {
          refModelName = schemaPath.options.ref;
        }

        if (schemaPath?.$embeddedSchemaType?.options?.ref) {
          refModelName = schemaPath.$embeddedSchemaType.options.ref;
        }

        let match: any = undefined;

        if (refModelName) {
          try {
            const refSchema = mongoose.model(refModelName)?.schema;
            if (refSchema?.path("active") && refSchema?.path("deleted")) {
              match = { active: true, deleted: { $ne: true } };
            }
          } catch {
            // Reference model might not be registered yet or not present
          }
        }

        const baseSelect = ["_id", "name", "code"];

        const effectiveExtrasSelect = options?.extras?.select || config?.extras?.select;
        if (effectiveExtrasSelect) {
          const extras = effectiveExtrasSelect.split(/[\s,]+/).filter(Boolean);
          baseSelect.push(...extras);
        }

        const nestedPopulate = options?.nestedPopulate?.find(
          (p) => p.path === path,
        );

        return {
          path,
          match,
          select: baseSelect.join(" "),
          ...(nestedPopulate && { populate: nestedPopulate.populate }),
        };
      }),
    );
  }

  const effectiveForcePopulate = options?.forcePopulate || config?.forcePopulate || config?.populate;
  if (effectiveForcePopulate && effectiveForcePopulate.length > 0) {
    data = await model.populate(data, effectiveForcePopulate);
  }

  const pages = limit === 0 ? 1 : Math.ceil(total / limit);

  return {
    success: true,
    message: "Data fetched successfully",
    data,
    pagination: {
      page,
      limit,
      total,
      pages,
      hasNext: page < pages,
      hasPrev: page > 1,
    },
  };
}
