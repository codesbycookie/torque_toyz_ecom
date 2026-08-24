// benchmark-schema-analysis.ts
// Run with: npx tsx benchmark-schema-analysis.ts
// (or ts-node, depending on what your project uses)

import mongoose from 'mongoose';
import Product from '@db/models/product.model.ts';
import User from '@db/models/user.model.ts';
import Location from '@db/models/location.model.ts';

// --- paste your CURRENT (uncached) analyzeSchemaPaths here, renamed ---
function analyzeSchemaPathsUncached(schema: mongoose.Schema, prefix = ''): any {
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
    if (schemaType.instance === 'Array' && schemaType.caster?.options?.ref) {
      populatePaths.push(fullPath);
      refIdPaths.push(fullPath);
    }
    if (schemaType.instance === 'Array' && schemaType.caster?.options?.refPath) {
      populatePaths.push(fullPath);
      refIdPaths.push(fullPath);
      dynamicRefPaths.push({ path: fullPath, refPath: schemaType.caster.options.refPath });
    }
    if (schemaType.schema instanceof mongoose.Schema) {
      const nested = analyzeSchemaPathsUncached(schemaType.schema, fullPath);
      populatePaths.push(...nested.populatePaths);
      refIdPaths.push(...nested.refIdPaths);
      dynamicRefPaths.push(...nested.dynamicRefPaths);
    }
  });

  return { populatePaths, refIdPaths, dynamicRefPaths };
}

// --- cached version ---
const analysisCache = new WeakMap<mongoose.Schema, any>();
function analyzeSchemaPathsCached(schema: mongoose.Schema): any {
  const cached = analysisCache.get(schema);
  if (cached) return cached;
  const result = analyzeSchemaPathsUncached(schema);
  analysisCache.set(schema, result);
  return result;
}

// --- benchmark runner ---
function bench(label: string, fn: () => void, iterations: number) {
  // warm up (JIT)
  for (let i = 0; i < 100; i++) fn();

  const start = process.hrtime.bigint();
  for (let i = 0; i < iterations; i++) fn();
  const end = process.hrtime.bigint();

  const totalMs = Number(end - start) / 1_000_000;
  const perCallUs = (totalMs * 1000) / iterations;

  console.log(
    `${label.padEnd(30)} total: ${totalMs.toFixed(2)}ms  |  per call: ${perCallUs.toFixed(3)}µs  |  iterations: ${iterations}`
  );
  return perCallUs;
}

const ITERATIONS = 50_000;
const models = { Product, User, Location };

console.log(`\nRunning ${ITERATIONS} iterations per schema...\n`);

for (const [name, model] of Object.entries(models)) {
  console.log(`--- ${name} ---`);
  const before = bench(`${name} (uncached)`, () => analyzeSchemaPathsUncached(model.schema), ITERATIONS);
  const after = bench(`${name} (cached)`, () => analyzeSchemaPathsCached(model.schema), ITERATIONS);
  const speedup = (before / after).toFixed(1);
  console.log(`=> ~${speedup}x faster per call\n`);
}

process.exit(0);