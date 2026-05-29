import { fakeParts } from "../../../lib/fake-ul-data"
import { withRouteSpec } from "../../../lib/middleware/with-winter-spec"
import { z } from "zod"

const partResponse = z.object({
  uid: z.string(),
  mpn: z.string(),
  manufacturer: z.string(),
  description: z.string(),
  symbol_available: z.boolean(),
  footprint_available: z.boolean(),
  package: z.string(),
})

export default withRouteSpec({
  methods: ["GET"],
  auth: "bearerToken",
  queryParams: z.object({
    q: z.string().min(1),
    exact_only: z
      .enum(["true", "false"])
      .optional()
      .transform((value) => value !== "false"),
    limit: z.coerce.number().int().min(1).max(50).optional().default(5),
  }),
  jsonResponse: z.object({
    query: z.string(),
    exact_only: z.boolean(),
    count: z.number(),
    parts: z.array(partResponse),
  }),
})((req, ctx) => {
  const query = req.query.q.toLowerCase()
  const exactOnly = req.query.exact_only
  const parts = fakeParts
    .filter((part) => {
      const mpn = part.mpn.toLowerCase()
      return exactOnly ? mpn === query : mpn.includes(query)
    })
    .slice(0, req.query.limit)

  if (parts.length === 0) {
    return Response.json(
      {
        error: {
          error_code: "part_not_found",
          message: "No fake part matched the query.",
        },
      },
      { status: 404 },
    )
  }

  return ctx.json({
    query: req.query.q,
    exact_only: exactOnly,
    count: parts.length,
    parts,
  })
})
