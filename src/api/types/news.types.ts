/** UI / admin jadvali uchun yangilik kartasi */
export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  specialty: string;
  /** Bo‘lim UUID; `null` — barcha bo‘limlar uchun umumiy yangilik */
  departmentId?: string | null;
  departmentName?: string | null;
  imageUrl?: string;
  source: string;
  publishedAt: string;
  readTime: string;
  isNew: boolean;
  tags: string[];
}

/** GET /api/news — server `NewsService.toApi()` javobi */
export interface NewsArticleDto {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  specialty: string;
  departmentId?: string | null;
  departmentName?: string | null;
  imageUrl: string;
  source: string;
  tags: string[];
  isNew: boolean;
  readTime: string;
  publishedAt: string;
}

/** POST /api/news — Nest DTO maydonlari */
export interface CreateNewsArticleBody {
  title: string;
  summary: string;
  content: string;
  category: string;
  specialty: string;
  /** Bo‘lim UUID; `null` yoki yo‘q — umumiy yangilik */
  department_id?: string | null;
  image_url?: string | null;
  source?: string | null;
  tags?: string[];
  is_new?: boolean;
  read_minutes?: number;
}

export type UpdateNewsArticleBody = Partial<CreateNewsArticleBody> & {
  published_at?: string;
};
