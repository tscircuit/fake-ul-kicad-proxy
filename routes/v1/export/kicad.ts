import { findPartByMpn } from "../../../lib/fake-ul-data"
import { createKiCadZip } from "../../../lib/kicad-zip"
import { withRouteSpec } from "../../../lib/middleware/with-winter-spec"
import { apiError } from "../../../lib/utils"
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
    return apiError("No fake part matched the mpn.", 404, "part_not_found")
  }

  if (!part.symbol_available || !part.footprint_available) {
    return apiError(
      "The fake part does not have both symbol and footprint assets.",
      409,
      "cad_assets_unavailable",
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
