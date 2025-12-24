import { describe, it, expect } from "vitest";

import { safeRedirect } from "./safeRedirect";

describe("safeRedirect", () => {
  const DEFAULT_REDIRECT = "/";

  describe("有効なパスの場合", () => {
    it("スラッシュで始まる通常のパスはそのまま返す", () => {
      expect(safeRedirect("/courses")).toBe("/courses");
      expect(safeRedirect("/xxx")).toBe("/xxx");
      expect(safeRedirect("/xxx?query=yyy")).toBe("/xxx?query=yyy");
    });

    it('ルートパス("/")はそのまま返す', () => {
      expect(safeRedirect("/")).toBe("/");
    });
  });

  describe("無効な入力の場合 (デフォルトへのフォールバック)", () => {
    it("null または undefined の場合はデフォルトを返す", () => {
      expect(safeRedirect(null)).toBe(DEFAULT_REDIRECT);
      expect(safeRedirect(undefined)).toBe(DEFAULT_REDIRECT);
    });

    it("空文字の場合はデフォルトを返す", () => {
      expect(safeRedirect("")).toBe(DEFAULT_REDIRECT);
    });

    it("文字列以外の FormDataEntryValue (Fileなど) はデフォルトを返す", () => {
      const file = new File([], "filename");
      expect(safeRedirect(file)).toBe(DEFAULT_REDIRECT);
    });
  });

  describe("セキュリティチェック (オープンリダイレクト対策)", () => {
    it("外部ドメイン(http/https)はデフォルトを返す", () => {
      expect(safeRedirect("https://example.com")).toBe(DEFAULT_REDIRECT);
      expect(safeRedirect("http://malicious-site.com")).toBe(DEFAULT_REDIRECT);
    });

    it('プロトコル相対URL ("//") はデフォルトを返す', () => {
      expect(safeRedirect("//example.com")).toBe(DEFAULT_REDIRECT);
      expect(safeRedirect("//localhost")).toBe(DEFAULT_REDIRECT);
    });

    it("スラッシュで始まらない相対パスはデフォルトを返す", () => {
      expect(safeRedirect("login")).toBe(DEFAULT_REDIRECT);
      expect(safeRedirect(".")).toBe(DEFAULT_REDIRECT);
    });
  });

  describe("カスタムデフォルトリダイレクト", () => {
    it("第2引数が指定されている場合、無効な入力に対してその値を返す", () => {
      const customDefault = "/home";

      expect(safeRedirect(null, customDefault)).toBe(customDefault);

      expect(safeRedirect("https://google.com", customDefault)).toBe(
        customDefault,
      );

      expect(safeRedirect("//evil.com", customDefault)).toBe(customDefault);
    });
  });
});
