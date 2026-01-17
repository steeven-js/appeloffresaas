import { pgTableCreator } from "drizzle-orm/pg-core";

/**
 * Multi-project schema feature of Drizzle ORM.
 * All tables will be prefixed with `appeloffresaas_` to avoid conflicts
 * when sharing a database instance across multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `appeloffresaas_${name}`);
