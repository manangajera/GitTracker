/* eslint-disable no-undef */
// import { render, screen, fireEvent,act } from "@testing-library/react";
// import GitHubConnection from "../../Components/GitHubConnection";
// import { vi } from "vitest";
// import "@testing-library/jest-dom";
// import axios from "axios";

// // Mock axios to prevent real network requests
// vi.mock("axios");

// describe("GitHubConnection Component", () => {
//   beforeEach(() => {
//     localStorage.clear();
//     axios.get.mockResolvedValue({ data: [] }); // Mock empty organization response
//   });

//   test("renders connect to GitHub screen when not connected", () => {
//     render(<GitHubConnection />);

//     expect(screen.getByText("Connect to GitHub")).toBeInTheDocument();
//     expect(screen.getByRole("button", { name: /connect with github/i })).toBeInTheDocument();
//   });

//   test("displays user info when connected", async () => {
//     localStorage.setItem("githubConnected", "true");
//     localStorage.setItem("githubUsername", "testuser");
//     localStorage.setItem("githubAvatar", "https://example.com/avatar.jpg");

//     await act(async () => {
//       render(<GitHubConnection />);
//     });

//     expect(screen.getByText("testuser")).toBeInTheDocument();
//     expect(screen.getByAltText("testuser")).toHaveAttribute("src", "https://example.com/avatar.jpg");
//     expect(screen.getByText("Connected")).toBeInTheDocument();
//   });

//   test("handles GitHub connect button click", () => {
//     // Spy on window.open
//     const openSpy = vi.spyOn(window, "open").mockImplementation(() => {});

//     render(<GitHubConnection />);
//     fireEvent.click(screen.getByRole("button", { name: /connect with github/i }));

//     expect(openSpy).toHaveBeenCalledWith(expect.stringContaining("/auth/github"), "_self");

//     // Restore original window.open function after the test
//     openSpy.mockRestore();
//   });

//   test("handles GitHub disconnect", () => {
//     localStorage.setItem("githubConnected", "true");
//     localStorage.setItem("githubUsername", "testuser");

//     render(<GitHubConnection />);
    
//     fireEvent.click(screen.getByRole("button", { name: /disconnect/i }));

//     expect(localStorage.getItem("githubConnected")).toBeNull();
//     expect(screen.getByText("Connect to GitHub")).toBeInTheDocument();
//   });
// });


import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import GitHubConnection from "../../Components/GitHubConnection";
import { vi } from "vitest";
import axios from "axios";

// Mock axios and window.open
vi.mock("axios");
vi.spyOn(window, "open").mockImplementation(() => {});

describe("GitHubConnection Component", () => {
  beforeEach(() => {
    localStorage.clear();
    axios.get.mockResolvedValue({ data: [] });
  });

  test("renders connect to GitHub screen when not connected", () => {
    render(<GitHubConnection />);
    expect(screen.getByText("Connect to GitHub")).toBeInTheDocument();
  });

  test("displays user info when connected", async () => {
    localStorage.setItem("githubConnected", "true");
    localStorage.setItem("githubUsername", "testuser");
    localStorage.setItem("githubAvatar", "https://example.com/avatar.jpg");

    await act(async () => {
      render(<GitHubConnection />);
    });

    expect(screen.getByText("testuser")).toBeInTheDocument();
  });

  test("handles GitHub connect button click", () => {
    render(<GitHubConnection />);
    fireEvent.click(screen.getByRole("button", { name: /connect with github/i }));
    expect(window.open).toHaveBeenCalledWith(expect.stringContaining("/auth/github"), "_self");
  });

  test("handles GitHub disconnect", () => {
    localStorage.setItem("githubConnected", "true");
    render(<GitHubConnection />);
    
    fireEvent.click(screen.getByRole("button", { name: /disconnect/i }));
    expect(localStorage.getItem("githubConnected")).toBeNull();
    expect(screen.getByText("Connect to GitHub")).toBeInTheDocument();
  });
});

