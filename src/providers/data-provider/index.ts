"use client";

import type { DataProvider } from "@refinedev/core";

// const API_URL = "https://api.fake-rest.refine.dev";
const API_URL = "https://partner-api-stg.joongna.com";

const fetcher = async (url: string, options?: RequestInit) =>
  fetch(url, {
    ...options,
    headers: {
      ...options?.headers,
      // Authorization: localStorage.getItem("my_access_token") ?? "",
      Authorization:
        "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzIwNzYwMDQ0LCJpYXQiOjE3MjA2NzM2NDQsImp0aSI6ImJhYWViMTk5ZDU0YTRhMmM5OTAzZGIxOTY3ZWU1M2I0IiwidXNlcl9zZXEiOjE0NDYsIm5pY2tuYW1lIjoiXHVjODcwXHVkNjFjXHViZTQ4Iiwic3ViIjoiaHllYmluam85MSIsImlzX3N0YWZmIjp0cnVlLCJhZG1pbl9tZW1iZXJfc2VxIjo1NzUsInJvbGUiOiJNQU5BR0VSIn0.umODzIaYJy5YwGY9A5kYXCytJUQaTdk-_9JGyXSJpVk",
    },
  });

export const dataProvider: DataProvider = {
  getList: async ({ resource, pagination, filters, sorters, meta }) => {
    console.log("getList", { resource, pagination, filters, sorters, meta });
    const params = new URLSearchParams();

    if (pagination) {
      params.append(
        // "_start",
        "page",
        (
          ((pagination.current ?? 1) - 1) *
          (pagination.pageSize ?? 25)
        ).toString()
      );
      params.append(
        // "_end",
        "pageSize",
        ((pagination.current ?? 1) * (pagination.pageSize ?? 25)).toString()
      );
    }

    if (sorters && sorters.length > 0) {
      params.append("_sort", sorters.map((sorter) => sorter.field).join(","));
      params.append("_order", sorters.map((sorter) => sorter.order).join(","));
    }

    if (filters && filters.length > 0) {
      filters.forEach((filter) => {
        if ("field" in filter && filter.operator === "eq") {
          // Our fake API supports "eq" operator by simply appending the field name and value to the query string.
          params.append(filter.field, filter.value);
        }
      });
    }

    const response = await fetcher(
      `${API_URL}/api/v2/sellers/list?${params.toString()}`
    );

    if (response.status < 200 || response.status > 299) throw response;

    const dataRes = await response.json();

    const data = dataRes.data.map((data: any, index: number) => ({
      ...data,
      id: index,
    }));

    const total = Number(response.headers.get("x-total-count"));

    return {
      data,
      total,
    };
  },
  getMany: async ({ resource, ids, meta }) => {
    const params = new URLSearchParams();

    if (ids) {
      ids.forEach((id) => params.append("id", id.toString()));
    }

    const response = await fetcher(
      `${API_URL}/${resource}?${params.toString()}`
    );

    if (response.status < 200 || response.status > 299) throw response;

    const data = await response.json();

    return { data };
  },
  getOne: async ({ resource, id, meta }) => {
    console.log("getOne", { resource, id, meta });
    const response = await fetcher(`${API_URL}/${resource}/${id}`);

    if (response.status < 200 || response.status > 299) throw response;

    const data = await response.json();

    return { data };
  },
  create: async ({ resource, variables }) => {
    const response = await fetcher(`${API_URL}/${resource}`, {
      method: "POST",
      body: JSON.stringify(variables),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status < 200 || response.status > 299) throw response;

    const data = await response.json();

    return { data };
  },
  update: async ({ resource, id, variables }) => {
    console.log("update", { resource, id, variables });
    const response = await fetcher(`${API_URL}/${resource}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(variables),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status < 200 || response.status > 299) throw response;

    const data = await response.json();

    return { data };
  },
  getApiUrl: () => API_URL,
  deleteOne: () => {
    throw new Error("Not implemented");
  },
  /* ... */
};
