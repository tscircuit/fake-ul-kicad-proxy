import {
  findExportFormat,
  findPartByMpn,
  findPartByUid,
} from "../../../lib/fake-ul-data"
import { withRouteSpec } from "../../../lib/middleware/with-winter-spec"
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
  const format = findExportFormat(req.jsonBody.format)

  if (part == null) {
    return Response.json(
      {
        error: {
          error_code: "part_not_found",
          message: "No fake part matched the request.",
        },
      },
      { status: 404 },
    )
  }

  if (format == null) {
    return Response.json(
      {
        error: {
          error_code: "unsupported_format",
          message: "Only KiCad fake exports exist.",
        },
      },
      { status: 400 },
    )
  }

  if (
    (format.requires_symbol && !part.symbol_available) ||
    (format.requires_footprint && !part.footprint_available)
  ) {
    return Response.json(
      {
        error: {
          error_code: "cad_assets_unavailable",
          message:
            "The fake part does not have the CAD assets required for this export.",
        },
      },
      { status: 409 },
    )
  }

  const url = new URL(req.url)
  url.pathname =
    format.file_type === "zip" ? "/v1/export/kicad" : "/v1/export/kicad_sym"
  url.search = new URLSearchParams(
    format.file_type === "zip"
      ? {
          mpn: part.mpn,
          version: req.jsonBody.version,
        }
      : {
          mpn: part.mpn,
        },
  ).toString()

  return ctx.json({
    status: "ready",
    uid: part.uid,
    mpn: part.mpn,
    format: format.id,
    download_url: url.toString(),
  })
})
