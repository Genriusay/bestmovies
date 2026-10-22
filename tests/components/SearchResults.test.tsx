import { render, screen } from "@testing-library/react";
import { it, expect } from "vitest";
import { SearchResults } from "@/components/SearchResults";
import type { MovieSummary, ProviderInfo } from "@/lib/tmdb/types";

const movie: MovieSummary = {
  id: 603,
  title: "Matrix",
  posterPath: "/p.jpg",
  backdropPath: null,
  year: 1999,
  voteAverage: 8.2,
  genreIds: [],
};
const prov = (id: number): ProviderInfo => ({ id, name: `Serv ${id}`, logoPath: `/l${id}.jpg` });

it("sem resultados mostra mensagem com a query", () => {
  render(<SearchResults query="xyzzy" results={[]} />);
  expect(screen.getByText('Nenhum filme encontrado para "xyzzy".')).toBeInTheDocument();
});

it("resultado sem provedores mostra aviso", () => {
  render(<SearchResults query="matrix" results={[{ movie, providers: [] }]} />);
  expect(screen.getByText("Não disponível em streaming no BR")).toBeInTheDocument();
  expect(screen.getByText("Matrix")).toBeInTheDocument();
  expect(screen.getByText("1999")).toBeInTheDocument();
});

it("mostra no máximo 4 logos", () => {
  render(
    <SearchResults
      query="matrix"
      results={[{ movie, providers: [1, 2, 3, 4, 5, 6].map(prov) }]}
    />,
  );
  expect(screen.getAllByAltText(/^Serv /)).toHaveLength(4);
  expect(screen.queryByText("Não disponível em streaming no BR")).not.toBeInTheDocument();
});

it("providers null (falha na consulta) não mostra logos nem aviso", () => {
  render(<SearchResults query="matrix" results={[{ movie, providers: null }]} />);
  expect(screen.getByText("Matrix")).toBeInTheDocument();
  expect(screen.queryByAltText(/^Serv /)).not.toBeInTheDocument();
  expect(screen.queryByText("Não disponível em streaming no BR")).not.toBeInTheDocument();
});
