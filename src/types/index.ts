// Types partagés — à enrichir au fil du développement

export type UserRole = "customer" | "admin";

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
}
