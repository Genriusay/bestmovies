import { render, screen } from "@testing-library/react";
import { it, expect } from "vitest";
import { Footer } from "@/components/Footer";

it("mostra a atribuição exigida", () => {
  render(<Footer />);
  expect(screen.getByAltText("TMDB")).toBeInTheDocument();
  expect(
    screen.getByText(
      /usa a API do TMDB, mas não é endossado nem certificado pelo TMDB/,
    ),
  ).toBeInTheDocument();
  expect(screen.getByText(/JustWatch/)).toBeInTheDocument();
});
