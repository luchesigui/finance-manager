import { server } from "@/test/server";
import { render, screen, userEvent, waitFor } from "@/test/test-utils";
import { http, HttpResponse } from "msw";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { LoginPage } from "../LoginPage";

const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
  usePathname: () => "/entrar",
}));

const mockSignInWithPassword = vi.fn();
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
    },
  }),
}));

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});
afterAll(() => server.close());

const selectors = {
  form: {
    getEmailInput: () => screen.getByLabelText(/email/i),
    getPasswordInput: () => screen.getByLabelText(/senha/i),
    getEntrarButton: () => screen.getByRole("button", { name: /entrar/i }),
    getCadastrarButton: () => screen.getByRole("button", { name: /cadastrar/i }),
  },
  heading: {
    getSignIn: () => screen.getByRole("heading", { name: /entrar na sua conta/i }),
    getSignUp: () => screen.getByRole("heading", { name: /criar nova conta/i }),
  },
  getCreateAccountToggle: () => screen.getByRole("button", { name: /criar uma conta/i }),
  findInvalidCredentialsMessage: () => screen.findByText(/invalid login credentials/i),
  findCadastrarButton: () => screen.findByRole("button", { name: /cadastrar/i }),
  findCheckEmailMessage: () => screen.findByText(/check your email for the confirmation link/i),
};

describe("LoginPage", () => {
  describe("Login", () => {
    it("renders sign-in form with email, password and submit", () => {
      render(<LoginPage />);
      expect(selectors.heading.getSignIn()).toBeInTheDocument();
      expect(selectors.form.getEmailInput()).toBeInTheDocument();
      expect(selectors.form.getPasswordInput()).toBeInTheDocument();
      expect(selectors.form.getEntrarButton()).toBeInTheDocument();
    });

    it("submitting with invalid credentials shows error message and does not navigate", async () => {
      const user = userEvent.setup();
      mockSignInWithPassword.mockResolvedValueOnce({
        error: { message: "Invalid login credentials" },
      });

      render(<LoginPage />);
      await user.type(selectors.form.getEmailInput(), "wrong@example.com");
      await user.type(selectors.form.getPasswordInput(), "wrongpass");
      await user.click(selectors.form.getEntrarButton());

      await expect(selectors.findInvalidCredentialsMessage()).resolves.toBeInTheDocument();
      expect(mockPush).not.toHaveBeenCalled();
      expect(mockRefresh).not.toHaveBeenCalled();
    });

    it("submitting with valid credentials calls router.push and router.refresh", async () => {
      const user = userEvent.setup();
      mockSignInWithPassword.mockResolvedValueOnce({ error: null });

      render(<LoginPage />);
      await user.type(selectors.form.getEmailInput(), "user@example.com");
      await user.type(selectors.form.getPasswordInput(), "validpassword");
      await user.click(selectors.form.getEntrarButton());

      await waitFor(() => {
        expect(mockSignInWithPassword).toHaveBeenCalledWith({
          email: "user@example.com",
          password: "validpassword",
        });
        expect(mockPush).toHaveBeenCalledWith("/");
        expect(mockRefresh).toHaveBeenCalled();
      });
    });

    it.todo("exibe mensagem amigável quando Supabase retorna erro de rede/timeout");
  });

  describe("Cadastro (sign-up)", () => {
    it("toggle to Cadastro shows sign-up view", async () => {
      const user = userEvent.setup();
      render(<LoginPage />);
      await user.click(selectors.getCreateAccountToggle());
      expect(selectors.heading.getSignUp()).toBeInTheDocument();
      expect(selectors.form.getCadastrarButton()).toBeInTheDocument();
    });

    it("submitting sign-up calls POST /api/auth/signup with correct body", async () => {
      const user = userEvent.setup();
      let capturedBody: unknown = null;
      server.use(
        http.post("/api/auth/signup", async ({ request }) => {
          capturedBody = await request.json();
          return HttpResponse.json({ requiresConfirmation: false });
        }),
      );

      render(<LoginPage />);
      await user.click(selectors.getCreateAccountToggle());
      await user.type(selectors.form.getEmailInput(), "new@example.com");
      await user.type(selectors.form.getPasswordInput(), "newpass123");
      await user.click(selectors.form.getCadastrarButton());

      await expect(selectors.findCadastrarButton()).resolves.toBeInTheDocument();
      expect(capturedBody).toEqual({ email: "new@example.com", password: "newpass123" });
    });

    it("on success with requiresConfirmation shows check email message", async () => {
      const user = userEvent.setup();
      server.use(
        http.post("/api/auth/signup", () => HttpResponse.json({ requiresConfirmation: true })),
      );

      render(<LoginPage />);
      await user.click(selectors.getCreateAccountToggle());
      await user.type(selectors.form.getEmailInput(), "new@example.com");
      await user.type(selectors.form.getPasswordInput(), "newpass123");
      await user.click(selectors.form.getCadastrarButton());

      await expect(selectors.findCheckEmailMessage()).resolves.toBeInTheDocument();
    });

    it("on success without confirmation redirects to /", async () => {
      const user = userEvent.setup();
      server.use(
        http.post("/api/auth/signup", () => HttpResponse.json({ requiresConfirmation: false })),
      );

      render(<LoginPage />);
      await user.click(selectors.getCreateAccountToggle());
      await user.type(selectors.form.getEmailInput(), "new@example.com");
      await user.type(selectors.form.getPasswordInput(), "newpass123");
      await user.click(selectors.form.getCadastrarButton());

      await expect(selectors.findCadastrarButton()).resolves.toBeInTheDocument();
      expect(mockPush).toHaveBeenCalledWith("/");
      expect(mockRefresh).toHaveBeenCalled();
    });

    it.todo("exibe mensagem de erro quando /api/auth/signup retorna 4xx/5xx");
    it.todo("exibe mensagem quando fetch do signup falha (rede)");
  });
});
