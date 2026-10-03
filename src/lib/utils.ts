import { createCn } from "cn/engine"
import tables from "./cn-tables.gen"

/** Tailwind-aware class merging, with the tables from src/lib/cn.config.ts. */
export const cn = createCn(tables)
