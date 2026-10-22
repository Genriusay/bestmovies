import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Pagination } from "@/components/Pagination";

const hrefFor = (p: number) => `/x?pagina=${p}`;

describe("Pagination", () => {
  it("na primeira página não tem Anterior", () => {
    render(<Pagination page={1} totalPages={5} hrefFor={hrefFor} />);
    expect(screen.queryByRole("link", { name: /Anterior/ })).toBeNull();
    expect(screen.getByRole("link", { name: /Próxima/ })).toBeInTheDocument();
    expect(screen.getByText("Página 1 de 5")).toBeInTheDocument();
  });
  it("na última não tem Próxima", () => {
    render(<Pagination page={5} totalPages={5} hrefFor={hrefFor} />);
    expect(screen.queryByRole("link", { name: /Próxima/ })).toBeNull();
    expect(screen.getByRole("link", { name: /Anterior/ })).toBeInTheDocument();
  });
  it("com 1 página não renderiza", () => {
    const { container } = render(<Pagination page={1} totalPages={1} hrefFor={hrefFor} />);
    expect(container).toBeEmptyDOMElement();
  });
  it("hrefFor é usado nos links", () => {
    render(<Pagination page={2} totalPages={5} hrefFor={hrefFor} />);
    expect(screen.getByRole("link", { name: /Anterior/ })).toHaveAttribute("href", "/x?pagina=1");
    expect(screen.getByRole("link", { name: /Próxima/ })).toHaveAttribute("href", "/x?pagina=3");
  });
});
