import { apiPostFormData, apiRequest } from "@/api/client";
import type {
  CreateNewsArticleBody,
  NewsArticleDto,
  NewsItem,
  UpdateNewsArticleBody,
} from "@/api/types/news.types";

/** Admin filtri: `departmentId` bo‘lmagan umumiy yangiliklar guruh kaliti */
export const NEWS_GLOBAL_DEPARTMENT_KEY = "__global_news__";

export function mapApiNewsToNewsItem(row: NewsArticleDto): NewsItem {
  const imageUrl = row.imageUrl?.trim();
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    content: row.content,
    category: row.category,
    specialty: row.specialty,
    departmentId: row.departmentId ?? null,
    departmentName: row.departmentName ?? null,
    imageUrl: imageUrl ? imageUrl : undefined,
    source: row.source?.trim() || "",
    publishedAt: row.publishedAt,
    readTime: row.readTime,
    isNew: row.isNew,
    tags: Array.isArray(row.tags) ? row.tags : [],
  };
}

export function groupNewsByDepartmentKey(rows: NewsArticleDto[]): Record<string, NewsItem[]> {
  const out: Record<string, NewsItem[]> = {};
  for (const row of rows) {
    const item = mapApiNewsToNewsItem(row);
    const key = item.departmentId ?? NEWS_GLOBAL_DEPARTMENT_KEY;
    if (!out[key]) out[key] = [];
    out[key].push(item);
  }
  for (const k of Object.keys(out)) {
    out[k].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }
  return out;
}

export async function uploadNewsCoverImage(file: File): Promise<{ imageUrl: string; publicId: string }> {
  const fd = new FormData();
  fd.append("file", file);
  return apiPostFormData("/api/news/upload-image", fd);
}

export async function fetchNewsArticles(opts?: {
  specialty?: string;
  departmentId?: string;
}): Promise<NewsArticleDto[]> {
  const params = new URLSearchParams();
  if (opts?.specialty?.trim()) params.set("specialty", opts.specialty.trim());
  if (opts?.departmentId?.trim()) params.set("departmentId", opts.departmentId.trim());
  const q = params.toString() ? `?${params.toString()}` : "";
  return apiRequest<NewsArticleDto[]>(`/api/news${q}`);
}

export async function fetchNewsArticleById(id: string): Promise<NewsArticleDto> {
  return apiRequest<NewsArticleDto>(`/api/news/${encodeURIComponent(id)}`);
}

export async function createNewsArticle(body: CreateNewsArticleBody): Promise<NewsArticleDto> {
  return apiRequest<NewsArticleDto>("/api/news", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateNewsArticle(
  id: string,
  body: UpdateNewsArticleBody,
): Promise<NewsArticleDto> {
  return apiRequest<NewsArticleDto>(`/api/news/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteNewsArticle(id: string): Promise<void> {
  await apiRequest<unknown>(`/api/news/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
