import { createWithWinterSpec } from "winterspec"
import { withBridgeToken } from "./with-bridge-token"

export const withRouteSpec = createWithWinterSpec({
  openapi: {
    apiName: "fake-ul-kicad-proxy",
    productionServerUrl: "https://fake-ul-kicad-proxy.local",
  },
  authMiddleware: {
    bearerToken: withBridgeToken,
  },
  beforeAuthMiddleware: [],
  afterAuthMiddleware: [],
})
