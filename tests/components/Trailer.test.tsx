import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Trailer } from "@/components/Trailer";

describe("Trailer", () => {
  it("renderiza iframe nocookie lazy", () => {
    render(<Trailer youtubeKey="abc123" title="Filme" />);
    const f = screen.getByTitle("Trailer de Filme");
    expect(f).toHaveAttribute("src", "https://www.youtube-nocookie.com/embed/abc123");
    expect(f).toHaveAttribute("loading", "lazy");
  });
  it("null não renderiza", () => {
    const { container } = render(<Trailer youtubeKey={null} title="Filme" />);
    expect(container).toBeEmptyDOMElement();
  });
});
