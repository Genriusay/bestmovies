import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CastList } from "@/components/CastList";

describe("CastList", () => {
  it("sem foto mostra iniciais", () => {
    render(<CastList cast={[{ id: 1, name: "Ana Souza", character: "X", profilePath: null }]} />);
    expect(screen.getByText("AS")).toBeInTheDocument();
    expect(screen.getByText("Ana Souza")).toBeInTheDocument();
  });
  it("com foto mostra imagem", () => {
    render(<CastList cast={[{ id: 1, name: "Ana Souza", character: "X", profilePath: "/a.jpg" }]} />);
    expect(screen.getByAltText("Ana Souza")).toBeInTheDocument();
  });
  it("lista vazia não renderiza", () => {
    const { container } = render(<CastList cast={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
