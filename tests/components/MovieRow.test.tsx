import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MovieRow } from "@/components/MovieRow";
import type { MovieSummary } from "@/lib/tmdb/types";

const m = (id: number): MovieSummary => ({
  id, title: `Filme ${id}`, posterPath: "/p.jpg", backdropPath: null,
  year: 2020, voteAverage: 7, genreIds: [],
});

describe("MovieRow", () => {
  it("sem seeAllHref não mostra ver tudo", () => {
    render(<MovieRow title="Netflix" movies={[m(1)]} />);
    expect(screen.queryByText(/ver tudo/i)).toBeNull();
    expect(screen.getByText("Netflix")).toBeInTheDocument();
  });
  it("com seeAllHref mostra ver tudo", () => {
    render(<MovieRow title="Netflix" movies={[m(1)]} seeAllHref="/servico/netflix" />);
    expect(screen.getByText(/ver tudo/i).closest("a")).toHaveAttribute("href", "/servico/netflix");
  });
  it("vazia não renderiza", () => {
    const { container } = render(<MovieRow title="X" movies={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
  it("ranked numera os filmes", () => {
    render(<MovieRow title="Top" movies={[m(1), m(2)]} ranked />);
    expect(screen.getAllByTestId("poster-rank").map((e) => e.textContent)).toEqual(["1", "2"]);
  });
});
