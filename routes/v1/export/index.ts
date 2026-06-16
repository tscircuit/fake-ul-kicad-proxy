import {
  findExportFormat,
  findPartByMpn,
  findPartByUid,
  isFormatAvailableForPart,
  isSupportedExportFormatId,
} from "../../../lib/fake-ul-data"
import { createStepZip } from "../../../lib/kicad-zip"
import { withRouteSpec } from "../../../lib/middleware/with-winter-spec"
import { z } from "zod"

const exportRequest = z.object({
  uid: z.string().optional(),
  mpn: z.string().optional(),
  format: z.string().optional(),
  export_format_id: z.string().optional(),
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
})((req) => {
  const formatId = getRequestedFormatId(req.jsonBody)
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

  if (!isSupportedExportFormatId(formatId)) {
  if (format == null) {
    return Response.json(
      {
        error: {
          error_code: "unsupported_format",
          message: "The requested fake export format is not supported.",
          message: "Only KiCad fake exports exist.",
        },
      },
      { status: 400 },
    )
  }

  if (!isFormatAvailableForPart(part, formatId)) {
  if (
    (format.requires_symbol && !part.symbol_available) ||
    (format.requires_footprint && !part.footprint_available)
  ) {
    return Response.json(
      {
        error: {
          error_code: "cad_assets_unavailable",
          message:
            formatId === "step"
              ? "The fake part does not have a synthetic STEP asset."
              : "The fake part does not have both symbol and footprint assets.",
            "The fake part does not have the CAD assets required for this export.",
        },
      },
      { status: 409 },
    )
  }

  if (formatId === "step") {
    const zip = createStepZip(part)

    return new Response(zip, {
      headers: {
        "content-disposition": `attachment; filename="${part.mpn}_STEP.zip"`,
        "content-type": "application/zip",
      },
    })
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

  return Response.json({
    status: "ready",
    uid: part.uid,
    mpn: part.mpn,
    format: formatId,
    format: format.id,
    download_url: url.toString(),
  })
})

function getRequestedFormatId(body: z.infer<typeof exportRequest>) {
  if (body.export_format_id != null && body.export_format_id.length > 0) {
    return body.export_format_id
  }

  if (body.format != null && body.format.length > 0) {
    return body.format
  }

  return body.version === "7" ? "kicad_v7" : "kicad_v6"
}
