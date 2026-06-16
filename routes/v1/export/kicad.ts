import { findPartByMpn, hasKicadAssets } from "../../../lib/fake-ul-data"
import { createKiCadZip } from "../../../lib/kicad-zip"
import { withRouteSpec } from "../../../lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["GET"],
  auth: "bearerToken",
  queryParams: z.object({
    mpn: z.string().min(1),
    version: z.enum(["6", "7"]).optional().default("6"),
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

  if (!hasKicadAssets(part)) {
    return Response.json(
      {
        error: {
          error_code: "cad_assets_unavailable",
          message:
            "The fake part does not have both symbol and footprint assets.",
        },
      },
      { status: 409 },
    )
  }

  const zip = createKiCadZip(part, req.query.version)

  return new Response(zip, {
    headers: {
      "content-disposition": `attachment; filename="${part.mpn}_KiCADv${req.query.version}.zip"`,
      "content-type": "application/zip",
    },
  })
})
