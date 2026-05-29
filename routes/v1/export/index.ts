import {
  findPartByMpn,
  findPartByUid,
  supportedExportFormats,
} from "../../../lib/fake-ul-data"
import { withRouteSpec } from "../../../lib/middleware/with-winter-spec"
import { apiError } from "../../../lib/utils"
import { z } from "zod"

const exportRequest = z.object({
  uid: z.string().optional(),
  mpn: z.string().optional(),
  format: z.string().optional().default("kicad_v6"),
  version: z.coerce.string().optional().default("6"),
})

export default withRouteSpec({
  methods: ["POST"],
  auth: "bearerToken",
  jsonBody: exportRequest.refine(
    (body) => body.uid != null || body.mpn != null,
    {
      message: "Either uid or mpn is required.",
    },
  ),
  jsonResponse: z.object({
    status: z.literal("ready"),
    uid: z.string(),
    mpn: z.string(),
    format: z.string(),
    download_url: z.string(),
  }),
})((req, ctx) => {
  const part =
    req.jsonBody.uid != null
      ? findPartByUid(req.jsonBody.uid)
      : findPartByMpn(req.jsonBody.mpn ?? "")

  if (part == null) {
    return apiError("No fake part matched the request.", 404, "part_not_found")
  }

  if (!part.symbol_available || !part.footprint_available) {
    return apiError(
      "The fake part does not have both symbol and footprint assets.",
      409,
      "cad_assets_unavailable",
    )
  }

  if (
    !supportedExportFormats.some((format) => format.id === req.jsonBody.format)
  ) {
    return apiError("Only KiCad fake exports exist.", 400, "unsupported_format")
  }

  const url = new URL(req.url)
  url.pathname = "/v1/export/kicad"
  url.search = new URLSearchParams({
    mpn: part.mpn,
    version: req.jsonBody.version,
  }).toString()

  return ctx.json({
    status: "ready",
    uid: part.uid,
    mpn: part.mpn,
    format: req.jsonBody.format,
    download_url: url.toString(),
  })
})
