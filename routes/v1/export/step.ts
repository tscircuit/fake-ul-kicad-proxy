import { findPartByMpn, hasStepAssets } from "../../../lib/fake-ul-data"
import { createStepZip } from "../../../lib/kicad-zip"
import { withRouteSpec } from "../../../lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["GET"],
  auth: "bearerToken",
  queryParams: z.object({
    mpn: z.string().min(1),
  }),
})((req) => {
  const part = findPartByMpn(req.query.mpn)
  if (part == null) {
    return Response.json(
      {
        error: {
          error_code: "part_not_found",
          message: "No fake part matched the mpn.",
        },
      },
      { status: 404 },
    )
  }

  if (!hasStepAssets(part)) {
    return Response.json(
      {
        error: {
          error_code: "cad_assets_unavailable",
          message: "The fake part does not have a synthetic STEP asset.",
        },
      },
      { status: 409 },
    )
  }

  const zip = createStepZip(part)

  return new Response(zip, {
    headers: {
      "content-disposition": `attachment; filename="${part.mpn}_STEP.zip"`,
      "content-type": "application/zip",
    },
  })
})
