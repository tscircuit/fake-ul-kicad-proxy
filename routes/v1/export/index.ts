import {
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
    return Response.json(
      {
        error: {
          error_code: "unsupported_format",
          message: "The requested fake export format is not supported.",
        },
      },
      { status: 400 },
    )
  }

  if (!isFormatAvailableForPart(part, formatId)) {
    return Response.json(
      {
        error: {
          error_code: "cad_assets_unavailable",
          message:
            formatId === "step"
              ? "The fake part does not have a synthetic STEP asset."
              : "The fake part does not have both symbol and footprint assets.",
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
  url.pathname = "/v1/export/kicad"
  url.search = new URLSearchParams({
    mpn: part.mpn,
    version: req.jsonBody.version,
  }).toString()

  return Response.json({
    status: "ready",
    uid: part.uid,
    mpn: part.mpn,
    format: formatId,
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
