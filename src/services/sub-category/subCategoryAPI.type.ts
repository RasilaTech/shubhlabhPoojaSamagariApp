import type { Meta } from "../product/productApi.type";

export interface SubCategory {
  id: string;
  name: string;
  image: string;
  parent_id: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubCategoryResponse {
  data: SubCategory[];
  meta: Meta;
}

export interface SubCategoryRequestQueryParams {
  parent_ids: string;
  page?: number;
  limit?: number;
  q?: string;
  sort_by?: "priority" | "name" | "createdAt" | "updated_at";
  sort_order?: "ASC" | "DESC";
}

export type SubCategoryPageParam = number;
