import { Schema } from "mongoose";

interface SchemaPathAnalysis {
  populatePaths: string[];
  refIdPaths: string[];
  dynamicRefPaths: { path: string; refPath: string }[];
}

const analysisCache = new WeakMap<Schema, SchemaPathAnalysis>();

const analyzeSchemaPathsUncached = (schema: Schema, prefix = ""): SchemaPathAnalysis => {
  const populatePaths: string[] = [];
  const refIdPaths: string[] = [];
  const dynamicRefPaths: { path: string; refPath: string }[] = [];

  schema.eachPath((pathName: string, schemaType: any) => {
    const fullPath = prefix ? `${prefix}.${pathName}` : pathName;
    const opts = schemaType?.options || {};

    if (opts.ref) {
      populatePaths.push(fullPath);
      refIdPaths.push(fullPath);
    }

    if (opts.refPath) {
      populatePaths.push(fullPath);
      refIdPaths.push(fullPath);
      dynamicRefPaths.push({ path: fullPath, refPath: opts.refPath });
    }

    if (schemaType.instance === "Array" && schemaType.caster?.options?.ref) {
      populatePaths.push(fullPath);
      refIdPaths.push(fullPath);
    }

    if (schemaType.instance === "Array" && schemaType.caster?.options?.refPath) {
      populatePaths.push(fullPath);
      refIdPaths.push(fullPath);
      dynamicRefPaths.push({ path: fullPath, refPath: schemaType.caster.options.refPath });
    }

    if (schemaType.schema instanceof Schema) {
      const nested = analyzeSchemaPathsUncached(schemaType.schema, fullPath);
      populatePaths.push(...nested.populatePaths);
      refIdPaths.push(...nested.refIdPaths);
      dynamicRefPaths.push(...nested.dynamicRefPaths);
    }
  });

  return { populatePaths, refIdPaths, dynamicRefPaths };
};

// Only the top-level (prefix === "") result is cacheable per-schema —
// recursive calls for nested subdocument schemas still run fresh, but
// there are far fewer of those and they're cheap.
export const analyzeSchemaPaths = (schema: Schema, prefix = ""): SchemaPathAnalysis => {
  if (prefix) return analyzeSchemaPathsUncached(schema, prefix);

  const cached = analysisCache.get(schema);
  if (cached) return cached;

  const result = analyzeSchemaPathsUncached(schema);
  analysisCache.set(schema, result);
  return result;
};