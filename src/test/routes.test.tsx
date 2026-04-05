import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Offers from "@/pages/Offers";
import Events from "@/pages/Events";
import Access from "@/pages/Access";

describe("public routes", () => {
  it("renders offers page heading", () => {
    render(
      <MemoryRouter initialEntries={["/offers"]}>
        <Routes>
          <Route path="/offers" element={<Offers />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByRole("heading", { name: /offres spéciales/i })).toBeInTheDocument();
  });

  it("renders events page heading", () => {
    render(
      <MemoryRouter initialEntries={["/events"]}>
        <Routes>
          <Route path="/events" element={<Events />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByRole("heading", { level: 1, name: /événements & célébrations/i })).toBeInTheDocument();
  });

  it("renders access page heading", () => {
    render(
      <MemoryRouter initialEntries={["/access"]}>
        <Routes>
          <Route path="/access" element={<Access />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByRole("heading", { name: /accès & quartier/i })).toBeInTheDocument();
  });
});
