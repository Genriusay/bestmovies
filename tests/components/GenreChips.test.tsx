import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GenreChips } from "@/components/GenreChips";

describe("GenreChips", () => {
  it("marca ativo e monta links", () => {
    render(<GenreChips genres={[{ id: 35, name: "Comédia" }]} activeId={35} basePath="/" />);
    expect(screen.getByRole("link", { name: "Comédia" })).toHaveAttribute("href", "/?genero=35");
    expect(screen.getByRole("link", { name: "Comédia" })).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("link", { name: "Todos" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Todos" })).not.toHaveAttribute("aria-current");
  });
  it("Todos fica ativo sem gênero", () => {
    render(<GenreChips genres={[{ id: 35, name: "Comédia" }]} activeId={null} basePath="/" />);
    expect(screen.getByRole("link", { name: "Todos" })).toHaveAttribute("aria-current", "true");
  });
});
