import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PosterCard } from "@/components/PosterCard";
import type { MovieSummary } from "@/lib/tmdb/types";

const m: MovieSummary = {
  id: 42, title: "Filme X", posterPath: "/p.jpg", backdropPath: null,
  year: 2020, voteAverage: 7.5, genreIds: [],
};

describe("PosterCard", () => {
  it("sem pôster mostra placeholder com título", () => {
    render(<PosterCard movie={{ ...m, posterPath: null, title: "Sem Capa" }} />);
    expect(screen.getByTestId("poster-placeholder")).toHaveTextContent("Sem Capa");
    expect(screen.getByRole("link")).toHaveAttribute("href", `/filme/${m.id}`);
  });
  it("com pôster tem link com aria-label e imagem", () => {
    render(<PosterCard movie={m} />);
    expect(screen.getByRole("link", { name: "Filme X" })).toBeInTheDocument();
    expect(screen.queryByTestId("poster-placeholder")).toBeNull();
  });
  it("com rank mostra o número", () => {
    render(<PosterCard movie={m} rank={3} />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });
  it("sem rank não mostra número", () => {
    render(<PosterCard movie={m} />);
    expect(screen.queryByTestId("poster-rank")).toBeNull();
  });
});
