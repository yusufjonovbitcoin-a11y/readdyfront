export class ApiContractError extends Error {
  constructor(
    public readonly area: "hospital-admin" | "analytics",
    public readonly endpoint: string,
    public readonly details?: unknown,
  ) {
    super(`API contract mismatch (${area}): ${endpoint}`);
    this.name = "ApiContractError";
  }
}
