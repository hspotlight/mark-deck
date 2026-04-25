import { renderMarp } from "@/modules/marp-preview";

describe("renderMarp", () => {
  it("returns HTML containing slide content", () => {
    const html = renderMarp("# Hello World\n\nSome content.", "default");
    expect(html).toContain("Hello World");
    expect(html).toContain("Some content.");
  });

  it("returns a complete HTML document", () => {
    const html = renderMarp("# Test", "default");
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("<body>");
    expect(html).toContain("</body>");
  });

  it("includes theme CSS in the output", () => {
    const html = renderMarp("# Slide", "default");
    expect(html).toContain("<style>");
  });

  it("switches to a custom mark-deck theme", () => {
    const html = renderMarp("# Professional Slide", "mark-deck-professional");
    expect(html).toContain("Professional Slide");
    // Professional theme uses #6366F1 accent
    expect(html).toContain("#6366F1");
  });

  it("switches to dark theme", () => {
    const html = renderMarp("# Dark Slide", "mark-deck-dark");
    expect(html).toContain("Dark Slide");
    // Dark theme uses #0F172A background
    expect(html).toContain("#0F172A");
  });

  it("does not bleed CSS between separate renders", () => {
    const html1 = renderMarp("# First", "mark-deck-professional");
    const html2 = renderMarp("# Second", "mark-deck-dark");
    // Each render is independent — dark theme bg should only appear in html2
    expect(html1).not.toContain("#0F172A");
    expect(html2).toContain("#0F172A");
  });
});
