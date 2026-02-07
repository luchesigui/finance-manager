import { setupServer } from "msw/node";

/**
 * MSW server for Node (Vitest). Use in tests that need to mock fetch.
 * Call server.listen() in beforeAll and server.resetHandlers() in afterEach.
 */
export const server = setupServer();
