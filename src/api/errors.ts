export class ApiContractError extends Error {
  readonly area: "hospital-admin" | "analytics";
  readonly endpoint: string;
  readonly details?: unknown;

  constructor(area: "hospital-admin" | "analytics", endpoint: string, details?: unknown) {
    super(`API contract mismatch (${area}): ${endpoint}`);
    this.name = "ApiContractError";
    this.area = area;
    this.endpoint = endpoint;
    this.details = details;
  }
}
