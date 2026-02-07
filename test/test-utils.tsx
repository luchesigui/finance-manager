import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type RenderOptions, render as rtlRender } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
  });
}

type WrapperProps = { children: React.ReactNode };

export function createWrapper(queryClient?: QueryClient) {
  const client = queryClient ?? createTestQueryClient();
  return function Wrapper({ children }: WrapperProps) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  queryClient?: QueryClient;
  wrapper?: React.ComponentType<{ children: React.ReactNode }>;
}

export function render(ui: React.ReactElement, options: CustomRenderOptions = {}) {
  const { queryClient, wrapper: CustomWrapper, ...renderOptions } = options;
  const Wrapper = CustomWrapper ?? createWrapper(queryClient);

  return {
    ...rtlRender(ui, {
      wrapper: Wrapper,
      ...renderOptions,
    }),
  };
}

export { screen, waitFor, within } from "@testing-library/react";
export { userEvent };
