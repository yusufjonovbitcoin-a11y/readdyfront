import { describe, it, expect } from "vitest";
import { getWindowedPageItems } from "./pagination";

describe("getWindowedPageItems", () => {
  it("should return all pages if total is small", () => {
    expect(getWindowedPageItems(1, 3)).toEqual([1, 2, 3]);
  });

  it("should add ellipses for large total pages", () => {
    const result = getWindowedPageItems(1, 10);
    expect(result).toContain("...");
    expect(result[result.length - 1]).toBe(10);
  });

  it("should center the current page within the window", () => {
    const result = getWindowedPageItems(5, 10, 1);
    // [1, '...', 4, 5, 6, '...', 10]
    expect(result).toEqual([1, "...", 4, 5, 6, "...", 10]);
  });
});
