/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as calendar from "../calendar.js";
import type * as crons from "../crons.js";
import type * as dataLoaders from "../dataLoaders.js";
import type * as googleCalendar from "../googleCalendar.js";
import type * as http from "../http.js";
import type * as links from "../links.js";
import type * as projects from "../projects.js";
import type * as routines from "../routines.js";
import type * as sampleData from "../sampleData.js";
import type * as search from "../search.js";
import type * as tasks from "../tasks.js";
import type * as types from "../types.js";
import type * as users from "../users.js";
import type * as utils from "../utils.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  calendar: typeof calendar;
  crons: typeof crons;
  dataLoaders: typeof dataLoaders;
  googleCalendar: typeof googleCalendar;
  http: typeof http;
  links: typeof links;
  projects: typeof projects;
  routines: typeof routines;
  sampleData: typeof sampleData;
  search: typeof search;
  tasks: typeof tasks;
  types: typeof types;
  users: typeof users;
  utils: typeof utils;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
