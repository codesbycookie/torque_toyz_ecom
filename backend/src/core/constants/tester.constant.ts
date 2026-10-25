import { expect } from 'vitest';
import request from 'supertest';
import app from '../../app.ts';
import User from '../../database/models/user.model.js';
import { generateToken } from '../../lib/jwt.ts';
import { randomUUID } from 'node:crypto';


const makeRequest = (method: string, url: string, body?: any, token?: string) => {
  let req = (request(app) as any)[method](url);
  if (token) {
    req = req.set('Authorization', `Bearer ${token}`);
  }
  if (body !== undefined) {
    req = req.send(body);
  }
  return req;
};

export const tester = {
  // Request wrappers
  get: (url: string, token?: string) => makeRequest('get', url, undefined, token),
  post: (url: string, body?: any, token?: string) => makeRequest('post', url, body, token),
  put: (url: string, body?: any, token?: string) => makeRequest('put', url, body, token),
  patch: (url: string, body?: any, token?: string) => makeRequest('patch', url, body, token),
  delete: (url: string, token?: string) => makeRequest('delete', url, undefined, token),

  postMultipart: (url: string, fields: any, files: { [key: string]: string | string[] }, token?: string) => {
    let req = request(app).post(url);
    if (token) req = req.set('Authorization', `Bearer ${token}`);
    for (const key of Object.keys(fields)) {
      if (typeof fields[key] === 'object') req = req.field(key, JSON.stringify(fields[key]));
      else req = req.field(key, String(fields[key]));
    }
    for (const [key, paths] of Object.entries(files)) {
      if (Array.isArray(paths)) {
        for (const p of paths) req = req.attach(key, p);
      } else {
        req = req.attach(key, paths as string);
      }
    }
    return req;
  },

  putMultipart: (url: string, fields: any, files: { [key: string]: string | string[] }, token?: string) => {
    let req = request(app).put(url);
    if (token) req = req.set('Authorization', `Bearer ${token}`);
    for (const key of Object.keys(fields)) {
      if (typeof fields[key] === 'object') req = req.field(key, JSON.stringify(fields[key]));
      else req = req.field(key, String(fields[key]));
    }
    for (const [key, paths] of Object.entries(files)) {
      if (Array.isArray(paths)) {
        for (const p of paths) req = req.attach(key, p);
      } else {
        req = req.attach(key, paths as string);
      }
    }
    return req;
  },

  // Auth/Setup helper
  setupAdmin: async () => {
  const mockUser = await User.create({
    name: 'Test Admin',
    email: `testadmin_${randomUUID()}@torquetoyz.com`,
    phone: `9${Math.floor(100000000 + Math.random() * 900000000)}`,
    password: 'Password123',
    role: 'admin', // fixed — was 'super_admin', which doesn't match the User schema enum
    active: true,
  });
  const token = generateToken({ id: mockUser._id, role: 'admin' }); // fixed
  const cleanup = async () => {
    await User.findByIdAndDelete(mockUser._id);
  };
  return { token, user: mockUser, cleanup };
},

  // Chai assertions
  assertSuccess: (res: any, message: string, dataMatcher?: (data: any) => void) => {
    expect(res.status).to.equal(200);
    expect(res.body.success).to.be.true;
    expect(res.body.message).to.equal(message);
    expect(res.body.timestamp).to.exist;
    if (dataMatcher) dataMatcher(res.body.data);
  },

  assertCreated: (res: any, model: string, dataMatcher?: (data: any) => void) => {
    expect(res.status).to.equal(201);
    expect(res.body.success).to.be.true;
    expect(res.body.message).to.equal(`${model.charAt(0).toUpperCase() + model.slice(1)} created successfully`);
    expect(res.body.timestamp).to.exist;
    if (dataMatcher) dataMatcher(res.body.data);
  },

  

  assertUpdated: (res: any, model: string, dataMatcher?: (data: any) => void) => {
    expect(res.status).to.equal(200);
    expect(res.body.success).to.be.true;
    expect(res.body.message).to.equal(`${model.charAt(0).toUpperCase() + model.slice(1)} updated successfully`);
    expect(res.body.timestamp).to.exist;
    if (dataMatcher) dataMatcher(res.body.data);
  },

  assertFetched: (res: any, model: string, expectedCount?: number) => {
    expect(res.status).to.equal(200);
    expect(res.body.success).to.be.true;
    expect(res.body.message).to.contain('fetched successfully');
    expect(res.body.timestamp).to.exist;
    expect(res.body.data).to.exist;
    if (expectedCount !== undefined) {
      expect(res.body.count).to.equal(expectedCount);
      expect(res.body.data.length).to.equal(expectedCount);
    }
  },

  assertNotFound: (res: any, model: string, expectedMessage?: string) => {
    expect(res.status).to.above(400);
    expect(res.body.success).to.be.false;
    expect(res.body.message).to.equal(
      expectedMessage ?? `${model.charAt(0).toUpperCase() + model.slice(1)} not found`,
    );
    expect(res.body.timestamp).to.exist;
  },

  assertDeleted: (res: any, model: string) => {
    expect(res.status).to.equal(200);
    expect(res.body.success).to.be.true;
    expect(res.body.message).to.equal(`${model.charAt(0).toUpperCase() + model.slice(1)} deleted successfully`);
    expect(res.body.timestamp).to.exist;
  },

  assertValidationError: (res: any, message?: string) => {
    expect(res.status).to.equal(400);
    expect(res.body.success).to.be.false;
    if (message) {
      expect(res.body.message).to.equal(message);
    }
    expect(res.body.timestamp).to.exist;
  },

  assertUnauthorized: (res: any, message: string = 'Unauthorized') => {
    expect(res.status).to.above(400);
    expect(res.body.success).to.be.false;
    expect(res.body.message).to.equal(message);
    expect(res.body.timestamp).to.exist;
  },

  assertForbidden: (res: any, message: string = 'Forbidden') => {
    expect(res.status).to.greaterThanOrEqual(400);
    expect(res.body.success).to.be.false;
    expect(res.body.message).to.equal(message);
    expect(res.body.timestamp).to.exist;
  },

  assertBadRequest: (res: any, message?: string) => {
  expect(res.status).to.equal(400);
  expect(res.body.success).to.be.false;
  if (message) {
    expect(res.body.message).to.equal(message);
  }
  expect(res.body.timestamp).to.exist;
},

assertConflict: (res: any, message?: string) => {
  expect(res.status).to.above(400);
  expect(res.body.success).to.be.false;
  if (message) {
    expect(res.body.message).to.equal(message);
  }
  expect(res.body.timestamp).to.exist;
},
};
