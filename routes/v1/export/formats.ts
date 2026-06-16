import {
  getAvailableExportFormats,
  findPartByUid,
} from "../../../lib/fake-ul-data"
import { withRouteSpec } from "../../../lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["GET"],
  auth: "bearerToken",
  queryParams: z.object({
    uid: z.string().min(1),
  }),
  jsonResponse: z.object({
    uid: z.string(),
    formats: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        cad_tool: z.string(),
        version: z.string(),
        file_type: z.string(),
      }),
    ),
  }),
})((req, ctx) => {
  const part = findPartByUid(req.query.uid)
  if (part == null) {
    return Response.json(
      {
        error: {
          error_code: "part_not_found",
          message: "No fake part matched the uid.",
        },
      },
      { status: 404 },
    )
  }

  return ctx.json({ uid: part.uid, formats: getAvailableExportFormats(part) })
})
