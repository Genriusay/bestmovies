import { describe, it, expect, vi, afterEach } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { HeroCarousel } from "@/components/HeroCarousel";
import type { MovieSummary } from "@/lib/tmdb/types";

const m = (id: number): MovieSummary => ({
  id, title: `Filme ${id}`, posterPath: null, backdropPath: "/b.jpg",
  year: 2020, voteAverage: 7.5, genreIds: [],
});

function mockMotion(reduce: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: reduce, media: query, addEventListener: vi.fn(), removeEventListener: vi.fn(),
    addListener: vi.fn(), removeListener: vi.fn(), onchange: null, dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

afterEach(() => vi.useRealTimers());

describe("HeroCarousel", () => {
  it("avança após 6s", () => {
    vi.useFakeTimers();
    mockMotion(false);
    render(<HeroCarousel movies={[m(1), m(2)]} />);
    expect(screen.getByRole("heading", { name: "Filme 1" })).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(6000); });
    expect(screen.getByRole("heading", { name: "Filme 2" })).toBeInTheDocument();
  });
  it("não avança com prefers-reduced-motion", () => {
    vi.useFakeTimers();
    mockMotion(true);
    render(<HeroCarousel movies={[m(1), m(2)]} />);
    act(() => { vi.advanceTimersByTime(12000); });
    expect(screen.getByRole("heading", { name: "Filme 1" })).toBeInTheDocument();
  });
  it("pontos trocam o slide e botão leva ao filme", () => {
    mockMotion(true);
    render(<HeroCarousel movies={[m(1), m(2)]} />);
    act(() => { screen.getByRole("button", { name: "Ir para o destaque 2" }).click(); });
    expect(screen.getByRole("heading", { name: "Filme 2" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ver onde assistir/i })).toHaveAttribute("href", "/filme/2");
  });
  it("vazio não renderiza", () => {
    mockMotion(false);
    const { container } = render(<HeroCarousel movies={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
