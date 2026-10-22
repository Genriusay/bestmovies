import { render, screen } from "@testing-library/react";
import { it, expect } from "vitest";
import { Header } from "@/components/Header";

it("tem busca que envia para /busca com q", () => {
  render(<Header />);
  const input = screen.getByLabelText("Buscar filme");
  expect(input).toHaveAttribute("name", "q");
  expect(input.closest("form")).toHaveAttribute("action", "/busca");
});
