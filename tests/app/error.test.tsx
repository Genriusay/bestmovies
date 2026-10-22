import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import ErrorPage from "@/app/error";

describe("error.tsx", () => {
  it("Tentar novamente chama retry", () => {
    const retry = vi.fn();
    render(<ErrorPage error={new Error("x")} retry={retry} />);
    expect(screen.getByText("Não foi possível carregar os filmes agora.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(retry).toHaveBeenCalledTimes(1);
  });
});
