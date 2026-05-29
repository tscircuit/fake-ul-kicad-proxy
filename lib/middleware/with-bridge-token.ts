import type { Middleware } from "winterspec"
import { apiError } from "../utils"

export const withBridgeToken: Middleware<
  {},
  {
    bridgeToken: string
  }
> = async (req, ctx, next) => {
  const authorization = req.headers.get("authorization")
  const match = authorization?.match(/^Bearer\s+(\S+)$/i)

  if (match?.[1] == null) {
    return apiError("Send the bridge token as a bearer token.", 401)
  }

  ctx.bridgeToken = match[1]

  return next(req, ctx)
}
