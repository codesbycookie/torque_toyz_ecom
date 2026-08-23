#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const rawName = process.argv[2];

if (!rawName) {
    console.error('Usage: node scripts/generate-module.js <module-name>');
    console.error('Example: node scripts/generate-module.js coupon');
    process.exit(1);
}

const name = rawName.toLowerCase();
const Pascal = name.charAt(0).toUpperCase() + name.slice(1);
const MODEL_IMPORT_PATH = `@db/models/${name}.model.ts`;

const MODULES_DIR = path.join(process.cwd(), 'backend', 'src', 'modules', name);

if (fs.existsSync(MODULES_DIR)) {
    console.error(`Module "${name}" already exists at ${MODULES_DIR}`);
    process.exit(1);
}

fs.mkdirSync(MODULES_DIR, { recursive: true });

const files = {
    [`${name}.validator.ts`]: `import { z } from 'zod';

export const create${Pascal}Schema = z.object({
  name: z.string().trim().min(2, 'Name is too short'),
});

export const update${Pascal}Schema = create${Pascal}Schema.partial();

export const set${Pascal}ActiveStatusSchema = z.object({
  active: z.boolean(),
});
`,

    [`${name}.constants.ts`]: `import { Types } from 'mongoose';
import { Role } from '@typings/auth.types.js';

const ROLE = { ADMIN: 'admin' } as const;

const UPDATE_OPTIONS = {
  new: true,
  runValidators: true,
  context: 'query',
} as const;

const SOFT_DELETE = {
  active: false,
  deleted: true,
  deletedAt: new Date(),
};

const RETRIEVE = {
  active: true,
  deleted: false,
  deletedAt: null,
};

const toObjectId = (value?: string | Types.ObjectId | null) => {
  if (!value) return null;
  if (value instanceof Types.ObjectId) return value;
  if (Types.ObjectId.isValid(value)) return new Types.ObjectId(value);
  return null;
};

const getVisibility = (role?: Role) => (role === ROLE.ADMIN ? 'all' : 'active-only');

export { UPDATE_OPTIONS, SOFT_DELETE, RETRIEVE, toObjectId, getVisibility };
`,

    [`${name}.util.ts`]: `import { enhanceDoc } from '@core/constants/enhancedoc.constant.ts';
import ${Pascal}Model, { I${Pascal} } from '${MODEL_IMPORT_PATH}';

export const enhance${Pascal} = (${name}: I${Pascal}) => {
  return enhanceDoc(${Pascal}Model, ${name}, []);
};
`,

    [`${name}.filterconfig.ts`]: `import { FilterConfig } from '@core/constants/dynamicfilter.constant.ts';
import { I${Pascal} } from '${MODEL_IMPORT_PATH}';

export const ${name}FilterConfig: FilterConfig<I${Pascal}> = {
  searchable: ['name'],
  filterable: ['active', 'deleted'],
  sortable: ['name', 'createdAt'],
  defaultSort: 'name',
};
`,

    [`${name}.services.ts`]: `import ${Pascal} from '${MODEL_IMPORT_PATH}';
import { dynamicFilter } from '@core/constants/dynamicfilter.constant.ts';
import { Create${Pascal}Payload, Update${Pascal}Payload } from '@typings/${name}.types.ts';
import { Role } from '@typings/auth.types.js';
import { UPDATE_OPTIONS, SOFT_DELETE, RETRIEVE, getVisibility } from './${name}.constants.ts';
import { enhance${Pascal} } from './${name}.util.ts';
import { ${name}FilterConfig } from './${name}.filterconfig.ts';

export const create${Pascal} = async (data: Create${Pascal}Payload) => {
  const ${name} = await new ${Pascal}(data).save();
  return enhance${Pascal}(${name});
};

export const getAll${Pascal}s = async (queries: Record<string, unknown>, role?: Role) => {
  return dynamicFilter(${Pascal}, ${name}FilterConfig, queries, {
    visibility: getVisibility(role),
  });
};

export const get${Pascal}ById = async (id: string) => {
  const ${name} = await ${Pascal}.findById(id);
  if (!${name}) return null;
  return enhance${Pascal}(${name});
};

export const update${Pascal} = async (id: string, data: Update${Pascal}Payload) => {
  const updated = await ${Pascal}.findByIdAndUpdate(id, data, UPDATE_OPTIONS);
  if (!updated) return null;
  return enhance${Pascal}(updated);
};

export const remove${Pascal} = async (id: string) => {
  const removed = await ${Pascal}.findByIdAndUpdate(id, SOFT_DELETE, { new: true });
  if (!removed) return null;
  return enhance${Pascal}(removed);
};

export const retrieve${Pascal} = async (id: string) => {
  const retrieved = await ${Pascal}.findByIdAndUpdate(id, RETRIEVE, { new: true });
  if (!retrieved) return null;
  return enhance${Pascal}(retrieved);
};

export const erase${Pascal} = async (id: string) => {
  const erased = await ${Pascal}.findByIdAndDelete(id);
  if (!erased) return null;
  return enhance${Pascal}(erased);
};

export const set${Pascal}ActiveStatus = async (id: string, active: boolean) => {
  const updated = await ${Pascal}.findByIdAndUpdate(
    id,
    { active, ...(active ? { deleted: false, deletedAt: null } : {}) },
    { new: true }
  );
  if (!updated) return null;
  return enhance${Pascal}(updated);
};
`,

    [`${name}.controller.ts`]: `import { Request, Response } from 'express';

import * as service from './${name}.services.ts';
import { Create${Pascal}Payload, Update${Pascal}Payload } from '@typings/${name}.types.ts';
import { createStatusControllers } from '@core/constants/createstatuscontroller.constant.ts';
import sendResponse from '@core/constants/responsewrapper.constant.ts';
import { buildQuery } from '@core/constants/querybuilder.constant.ts';
import { wrapControllers } from '@core/constants/wrapcontroller.constant.ts';

const ${name}Status = createStatusControllers(
  {
    remove: service.remove${Pascal},
    setActiveStatus: service.set${Pascal}ActiveStatus,
    retrieve: service.retrieve${Pascal},
  },
  '${name}'
);

const controllers = {
  create${Pascal}: async (req: Request<{}, {}, Create${Pascal}Payload>, res: Response) => {
    const ${name} = await service.create${Pascal}(req.body);
    return sendResponse.created(res, '${Pascal}', ${name});
  },

  getAll${Pascal}s: async (req: Request, res: Response) => {
    const queries = buildQuery(req);
    const result = await service.getAll${Pascal}s(queries, req.user?.role);
    return sendResponse.paginated(res, '${name}', result);
  },

  get${Pascal}ById: async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    const ${name} = await service.get${Pascal}ById(id);
    if (!${name}) return sendResponse.notFound(res, '${name}');
    return sendResponse.fetched(res, '${name}', ${name});
  },

  update${Pascal}: async (req: Request<{ id: string }, {}, Update${Pascal}Payload>, res: Response) => {
    const { id } = req.params;
    const ${name} = await service.update${Pascal}(id, req.body);
    if (!${name}) return sendResponse.notFound(res, '${name}');
    return sendResponse.updated(res, '${name}', ${name});
  },

  delete${Pascal}: ${name}Status.softDelete,
  set${Pascal}ActiveStatus: ${name}Status.setActiveStatus,
  retrieve${Pascal}: ${name}Status.retrieve,

  erase${Pascal}: async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    const ${name} = await service.erase${Pascal}(id);
    if (!${name}) return sendResponse.notFound(res, '${name}');
    return sendResponse.deleted(res, '${name}');
  },
};

export const {
  create${Pascal},
  getAll${Pascal}s,
  get${Pascal}ById,
  update${Pascal},
  delete${Pascal},
  set${Pascal}ActiveStatus,
  retrieve${Pascal},
  erase${Pascal},
} = wrapControllers(controllers);
`,

    [`${name}.route.ts`]: `import { Router } from 'express';
import { authMiddleware } from '@core/middlewares/auth.middleware.js';
// import { accessControl } from '@core/middlewares/access.middleware.js';
import { zodValidate } from '@core/middlewares/zod.validator.js';
import {
  create${Pascal}Schema,
  update${Pascal}Schema,
  set${Pascal}ActiveStatusSchema,
} from './${name}.validator.js';

import {
  create${Pascal},
  getAll${Pascal}s,
  get${Pascal}ById,
  update${Pascal},
  delete${Pascal},
  set${Pascal}ActiveStatus,
  retrieve${Pascal},
  erase${Pascal},
} from './${name}.controller.js';

const router = Router();

router.use(authMiddleware);

// router.use(accessControl);

router.post('/', zodValidate(create${Pascal}Schema, 'body', 'Create${Pascal}Schema'), create${Pascal});

router.get('/', getAll${Pascal}s);

router.get('/:id', get${Pascal}ById);

router.put('/:id', zodValidate(update${Pascal}Schema, 'body', 'Update${Pascal}Schema'), update${Pascal});

router.delete('/:id', delete${Pascal});

router.patch(
  '/:id/active-status',
  zodValidate(set${Pascal}ActiveStatusSchema, 'body', 'Set${Pascal}ActiveStatusSchema'),
  set${Pascal}ActiveStatus
);

router.put('/:id/retrieve', retrieve${Pascal});

router.delete('/:id/erase', erase${Pascal});

export default router;
`,
};

for (const [filename, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(MODULES_DIR, filename), content);
    console.log(`  created  src/modules/${name}/${filename}`);
}

// typings file lives outside the module folder, matching your convention
const TYPINGS_DIR = path.join(process.cwd(), 'src', 'typings');
if (!fs.existsSync(TYPINGS_DIR)) fs.mkdirSync(TYPINGS_DIR, { recursive: true });

const typingsContent = `import { create${Pascal}Schema, update${Pascal}Schema } from '@modules/${name}/${name}.validator.ts';
import z from 'zod';

export type Create${Pascal}Payload = z.infer<typeof create${Pascal}Schema>;
export type Update${Pascal}Payload = z.infer<typeof update${Pascal}Schema>;
`;

fs.writeFileSync(path.join(TYPINGS_DIR, `${name}.types.ts`), typingsContent);
console.log(`  created  src/typings/${name}.types.ts`);

console.log(`\nModule "${name}" scaffolded. Still need to:`);
console.log(`  1. Create src/db/models/${name}.model.ts yourself (schema shape varies too much to guess)`);
console.log(`  2. Mount the route in your main router: router.use('/${name}s', ${name}Router)`);