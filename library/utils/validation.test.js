/**
 * Tests for validation.js utilities
 *
 * Note: Jest is not currently in package.json dependencies.
 * To run tests, first install Jest:
 *   pnpm add -D jest @types/jest
 *
 * Then run:
 *   pnpm jest validation.test.js
 */

import {
  sanitizeUserInput,
  validateShareCode,
  isValidShareCodeFormat,
  validateListInput,
  validateItemInput,
  isValidHexColor,
  isValidTmdbId,
  validatePagination,
  LIMITS,
} from "./validation";

// Mock console for cleaner test output
const originalConsole = { ...console };
beforeAll(() => {
  console.log = jest.fn();
  console.warn = jest.fn();
});
afterAll(() => {
  console.log = originalConsole.log;
  console.warn = originalConsole.warn;
});

// =============================================================================
// sanitizeUserInput Tests
// =============================================================================

describe("sanitizeUserInput", () => {
  test("returns empty string for null/undefined", () => {
    expect(sanitizeUserInput(null)).toBe("");
    expect(sanitizeUserInput(undefined)).toBe("");
  });

  test("converts non-string to string", () => {
    expect(sanitizeUserInput(123)).toBe("123");
    expect(sanitizeUserInput(true)).toBe("true");
  });

  test("trims whitespace by default", () => {
    expect(sanitizeUserInput("  hello  ")).toBe("hello");
  });

  test("does not trim when option is false", () => {
    expect(sanitizeUserInput("  hello  ", { trim: false })).toBe("  hello  ");
  });

  test("removes newlines by default", () => {
    expect(sanitizeUserInput("hello\nworld")).toBe("hello world");
    expect(sanitizeUserInput("hello\r\nworld")).toBe("hello world");
  });

  test("preserves newlines when option is true", () => {
    expect(sanitizeUserInput("hello\nworld", { allowNewlines: true })).toBe(
      "hello\nworld"
    );
  });

  test("collapses multiple spaces", () => {
    expect(sanitizeUserInput("hello    world")).toBe("hello world");
  });

  test("removes null bytes", () => {
    expect(sanitizeUserInput("hello\0world")).toBe("helloworld");
  });

  test("escapes HTML entities", () => {
    expect(sanitizeUserInput("<script>")).toBe("&lt;script&gt;");
    expect(sanitizeUserInput('a & "b" \'c\'')).toBe(
      "a &amp; &quot;b&quot; &#x27;c&#x27;"
    );
  });

  test("enforces max length", () => {
    expect(sanitizeUserInput("hello world", { maxLength: 5 })).toBe("hello");
  });

  test("handles XSS attempt", () => {
    const xss = '<img src="x" onerror="alert(1)">';
    const sanitized = sanitizeUserInput(xss);
    expect(sanitized).not.toContain("<");
    expect(sanitized).not.toContain(">");
  });
});

// =============================================================================
// validateShareCode Tests
// =============================================================================

describe("validateShareCode", () => {
  test("validates correct share codes", () => {
    expect(validateShareCode("X7Kp2m")).toEqual({ valid: true });
    expect(validateShareCode("abcdef")).toEqual({ valid: true });
    expect(validateShareCode("ABCDEF")).toEqual({ valid: true });
    expect(validateShareCode("234567")).toEqual({ valid: true });
  });

  test("rejects null/undefined", () => {
    expect(validateShareCode(null).valid).toBe(false);
    expect(validateShareCode(undefined).valid).toBe(false);
  });

  test("rejects wrong length", () => {
    expect(validateShareCode("abc").valid).toBe(false);
    expect(validateShareCode("abcdefgh").valid).toBe(false);
  });

  test("rejects ambiguous characters", () => {
    // 0, 1, I, l, O are excluded
    expect(validateShareCode("a0bcde").valid).toBe(false);
    expect(validateShareCode("a1bcde").valid).toBe(false);
    expect(validateShareCode("aIbcde").valid).toBe(false);
    expect(validateShareCode("albcde").valid).toBe(false);
    expect(validateShareCode("aObcde").valid).toBe(false);
  });

  test("rejects invalid characters", () => {
    expect(validateShareCode("abc-de").valid).toBe(false);
    expect(validateShareCode("abc de").valid).toBe(false);
    expect(validateShareCode("abc!de").valid).toBe(false);
  });
});

describe("isValidShareCodeFormat", () => {
  test("returns boolean", () => {
    expect(isValidShareCodeFormat("X7Kp2m")).toBe(true);
    expect(isValidShareCodeFormat("invalid")).toBe(false);
  });
});

// =============================================================================
// validateListInput Tests
// =============================================================================

describe("validateListInput", () => {
  const validListData = {
    title: "My Test List",
    description: "A test description",
    type: "movie",
    theme: "classic",
    accentColor: "#3B82F6",
    year: 2024,
    isPublic: true,
    items: [
      { id: 123, title: "Test Movie", userRating: 5, comment: "Great!" },
    ],
  };

  test("validates correct list data", () => {
    const result = validateListInput(validListData);
    expect(result.valid).toBe(true);
    expect(result.data).toBeDefined();
  });

  test("rejects null/undefined", () => {
    expect(validateListInput(null).valid).toBe(false);
    expect(validateListInput(undefined).valid).toBe(false);
  });

  test("requires title", () => {
    const data = { ...validListData, title: undefined };
    expect(validateListInput(data).valid).toBe(false);
  });

  test("rejects empty title", () => {
    const data = { ...validListData, title: "   " };
    expect(validateListInput(data).valid).toBe(false);
  });

  test("sanitizes title", () => {
    const data = { ...validListData, title: "<script>alert(1)</script>" };
    const result = validateListInput(data);
    expect(result.valid).toBe(true);
    expect(result.data.title).not.toContain("<script>");
  });

  test("enforces title max length", () => {
    const data = { ...validListData, title: "x".repeat(300) };
    const result = validateListInput(data);
    expect(result.valid).toBe(true);
    expect(result.data.title.length).toBe(LIMITS.TITLE_MAX);
  });

  test("requires valid type/category", () => {
    const data = { ...validListData, type: "invalid" };
    expect(validateListInput(data).valid).toBe(false);
  });

  test("accepts category alias", () => {
    const data = { ...validListData, type: undefined, category: "tv" };
    const result = validateListInput(data);
    expect(result.valid).toBe(true);
    expect(result.data.type).toBe("tv");
  });

  test("validates theme", () => {
    const data = { ...validListData, theme: "invalid" };
    expect(validateListInput(data).valid).toBe(false);

    const data2 = { ...validListData, theme: "awards" };
    expect(validateListInput(data2).valid).toBe(true);
  });

  test("defaults theme to classic", () => {
    const data = { ...validListData, theme: undefined };
    const result = validateListInput(data);
    expect(result.data.theme).toBe("classic");
  });

  test("validates accent color format", () => {
    expect(
      validateListInput({ ...validListData, accentColor: "red" }).valid
    ).toBe(false);
    expect(
      validateListInput({ ...validListData, accentColor: "#GGG" }).valid
    ).toBe(false);
    expect(
      validateListInput({ ...validListData, accentColor: "#ff0000" }).valid
    ).toBe(true);
  });

  test("validates year range", () => {
    expect(validateListInput({ ...validListData, year: 1500 }).valid).toBe(
      false
    );
    expect(validateListInput({ ...validListData, year: 3000 }).valid).toBe(
      false
    );
    expect(validateListInput({ ...validListData, year: 1990 }).valid).toBe(
      true
    );
  });

  test("converts isPublic to boolean", () => {
    const result = validateListInput({ ...validListData, isPublic: 1 });
    expect(result.data.isPublic).toBe(true);
  });

  test("validates items array", () => {
    const data = { ...validListData, items: "not an array" };
    expect(validateListInput(data).valid).toBe(false);
  });

  test("enforces items limit", () => {
    const data = {
      ...validListData,
      items: Array(150)
        .fill(null)
        .map((_, i) => ({ id: i, title: `Item ${i}` })),
    };
    expect(validateListInput(data).valid).toBe(false);
  });

  test("validates each item", () => {
    const data = {
      ...validListData,
      items: [{ id: 1, title: "Valid" }, { id: null }],
    };
    const result = validateListInput(data);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("Item 2"))).toBe(true);
  });
});

// =============================================================================
// validateItemInput Tests
// =============================================================================

describe("validateItemInput", () => {
  const validItem = {
    id: 12345,
    title: "Test Movie",
    userRating: 4,
    comment: "Great movie!",
  };

  test("validates correct item", () => {
    const result = validateItemInput(validItem);
    expect(result.valid).toBe(true);
  });

  test("rejects null/undefined", () => {
    expect(validateItemInput(null).valid).toBe(false);
    expect(validateItemInput(undefined).valid).toBe(false);
  });

  test("requires id", () => {
    const item = { ...validItem, id: undefined };
    expect(validateItemInput(item).valid).toBe(false);
  });

  test("accepts numeric id", () => {
    const result = validateItemInput({ ...validItem, id: 123 });
    expect(result.valid).toBe(true);
    expect(result.data.id).toBe(123);
  });

  test("accepts string id", () => {
    const result = validateItemInput({ ...validItem, id: "abc-123" });
    expect(result.valid).toBe(true);
  });

  test("sanitizes string id", () => {
    const result = validateItemInput({ ...validItem, id: 'abc<script>"' });
    expect(result.valid).toBe(true);
    expect(result.data.id).toBe("abc");
  });

  test("rejects negative numeric id", () => {
    expect(validateItemInput({ ...validItem, id: -1 }).valid).toBe(false);
  });

  test("sanitizes comment", () => {
    const result = validateItemInput({
      ...validItem,
      comment: '<script>alert("xss")</script>',
    });
    expect(result.valid).toBe(true);
    expect(result.data.comment).not.toContain("<script>");
  });

  test("enforces comment max length", () => {
    const result = validateItemInput({
      ...validItem,
      comment: "x".repeat(1000),
    });
    expect(result.data.comment.length).toBe(LIMITS.COMMENT_MAX);
  });

  test("validates userRating range", () => {
    expect(validateItemInput({ ...validItem, userRating: 0 }).valid).toBe(
      false
    );
    expect(validateItemInput({ ...validItem, userRating: 6 }).valid).toBe(
      false
    );
    expect(validateItemInput({ ...validItem, userRating: 3 }).valid).toBe(true);
  });

  test("allows null userRating", () => {
    const result = validateItemInput({ ...validItem, userRating: null });
    expect(result.valid).toBe(true);
  });

  test("rounds userRating to integer", () => {
    const result = validateItemInput({ ...validItem, userRating: 3.7 });
    expect(result.data.userRating).toBe(4);
  });
});

// =============================================================================
// Helper Function Tests
// =============================================================================

describe("isValidHexColor", () => {
  test("accepts valid hex colors", () => {
    expect(isValidHexColor("#000000")).toBe(true);
    expect(isValidHexColor("#FFFFFF")).toBe(true);
    expect(isValidHexColor("#3B82F6")).toBe(true);
    expect(isValidHexColor("#abc123")).toBe(true);
  });

  test("rejects invalid colors", () => {
    expect(isValidHexColor("red")).toBe(false);
    expect(isValidHexColor("#FFF")).toBe(false); // 3 char
    expect(isValidHexColor("000000")).toBe(false); // no hash
    expect(isValidHexColor("#GGGGGG")).toBe(false); // invalid chars
    expect(isValidHexColor(null)).toBe(false);
  });
});

describe("isValidTmdbId", () => {
  test("accepts positive integers", () => {
    expect(isValidTmdbId(1)).toBe(true);
    expect(isValidTmdbId(12345)).toBe(true);
    expect(isValidTmdbId("999")).toBe(true);
  });

  test("rejects invalid ids", () => {
    expect(isValidTmdbId(0)).toBe(false);
    expect(isValidTmdbId(-1)).toBe(false);
    expect(isValidTmdbId(1.5)).toBe(false);
    expect(isValidTmdbId("abc")).toBe(false);
    expect(isValidTmdbId(null)).toBe(false);
  });
});

describe("validatePagination", () => {
  test("returns valid page and limit", () => {
    const result = validatePagination({ page: 2, limit: 50 });
    expect(result.page).toBe(2);
    expect(result.limit).toBe(50);
  });

  test("defaults to page 1, limit 20", () => {
    const result = validatePagination({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
  });

  test("enforces minimum values", () => {
    const result = validatePagination({ page: -1, limit: 0 });
    expect(result.page).toBe(1);
    expect(result.limit).toBe(1);
  });

  test("enforces max limit", () => {
    const result = validatePagination({ limit: 500 });
    expect(result.limit).toBe(100);

    const customResult = validatePagination({ limit: 500 }, 50);
    expect(customResult.limit).toBe(50);
  });

  test("handles string values", () => {
    const result = validatePagination({ page: "3", limit: "25" });
    expect(result.page).toBe(3);
    expect(result.limit).toBe(25);
  });
});
