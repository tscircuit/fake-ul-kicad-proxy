import { createWithWinterSpec } from "winterspec"

export const withRouteSpec = createWithWinterSpec({
  openapi: {
    apiName: "fake-ul-kicad-proxy",
    productionServerUrl: "https://fake-ul-kicad-proxy.local",
  },
  authMiddleware: {},
  beforeAuthMiddleware: [],
  afterAuthMiddleware: [],
})
