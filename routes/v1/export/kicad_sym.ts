import { findPartByMpn } from "../../../lib/fake-ul-data"
import { createKiCadSymbol } from "../../../lib/kicad-zip"
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

  if (!part.symbol_available) {
    return Response.json(
      {
        error: {
          error_code: "cad_assets_unavailable",
          message: "The fake part does not have a symbol asset.",
        },
      },
      { status: 409 },
    )
  }

  return new Response(createKiCadSymbol(part), {
    headers: {
      "content-disposition": `attachment; filename="${part.mpn}.kicad_sym"`,
      "content-type": "text/plain; charset=utf-8",
    },
  })
})
