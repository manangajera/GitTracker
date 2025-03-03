/* eslint-disable no-undef */
import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import CommitsGrid from "../../Pages/gridCommits"; // Adjust the import path if needed
import { vi } from "vitest";
import axios from "axios";

vi.mock("axios");

describe("CommitsGrid Component", () => {
  const mockData = {
    data: [
      {
        sha: "abc123",
        commit: {
          author: { name: "Alice", email: "alice@example.com", date: "2025-03-01T12:00:00Z" },
          message: "Initial commit",
        },
        html_url: "https://github.com/example/commit/abc123",
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders grid and search bar", async () => {
    await act(async () => {
      render(<CommitsGrid org="test-org" repo="test-repo" />);
    });

    expect(screen.getByPlaceholderText("Filter...")).toBeInTheDocument();
  });

  test("shows loading state initially", async () => {
    axios.get.mockResolvedValueOnce(new Promise(() => {})); // Simulate a pending API request

    await act(async () => {
      render(<CommitsGrid org="test-org" repo="test-repo" />);
    });

    // Ensure loading skeleton is displayed
    expect(screen.getByTestId("skeleton-loader")).toBeInTheDocument();
  });

  test("fetches and displays commits", async () => {
    axios.get.mockResolvedValueOnce(mockData);

    await act(async () => {
      render(<CommitsGrid org="test-org" repo="test-repo" />);
    });

    await waitFor(() => screen.getByText("Alice"));
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Initial commit")).toBeInTheDocument();
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
  });

  test("filters data based on search input", async () => {
    axios.get.mockResolvedValueOnce(mockData);

    await act(async () => {
      render(<CommitsGrid org="test-org" repo="test-repo" />);
    });

    await waitFor(() => screen.getByText("Alice"));

    // Simulate typing into the search bar
    fireEvent.change(screen.getByPlaceholderText("Filter..."), { target: { value: "Alice" } });

    // Ensure Alice's commit is still visible
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });
});
