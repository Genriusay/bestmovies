import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { WatchProviders } from "@/components/WatchProviders";

describe("WatchProviders", () => {
  it("vazio mostra aviso", () => {
    render(<WatchProviders watch={{ flatrate: [], rent: [], buy: [] }} />);
    expect(screen.getByText("Onde assistir no Brasil")).toBeInTheDocument();
    expect(
      screen.getByText("Este filme não está disponível em streaming no Brasil no momento."),
    ).toBeInTheDocument();
  });
  it("omite linhas vazias", () => {
    render(
      <WatchProviders
        watch={{ flatrate: [{ id: 8, name: "Netflix", logoPath: "/n.png" }], rent: [], buy: [] }}
      />,
    );
    expect(screen.getByText("Assinatura")).toBeInTheDocument();
    expect(screen.queryByText("Alugar")).toBeNull();
    expect(screen.queryByText("Comprar")).toBeNull();
    expect(screen.getByAltText("Netflix")).toBeInTheDocument();
  });
  it("mostra todas as linhas e provedor sem logo pelo nome", () => {
    render(
      <WatchProviders
        watch={{
          flatrate: [{ id: 1, name: "A", logoPath: "/a.png" }],
          rent: [{ id: 2, name: "B", logoPath: null }],
          buy: [{ id: 3, name: "C", logoPath: "/c.png" }],
        }}
      />,
    );
    expect(screen.getByText("Alugar")).toBeInTheDocument();
    expect(screen.getByText("Comprar")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });
});
