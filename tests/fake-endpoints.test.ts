import { expect, test } from "bun:test"
import { getTestServer } from "./fixtures/getTestServer"

const auth = {
  authorization: "Bearer test-token",
}

test("searches fake parts by exact mpn", async () => {
  const { ky } = await getTestServer()

  const response = await ky.get("v1/parts/search", {
    headers: auth,
    searchParams: { q: "LM358", exact_only: "true", limit: "1" },
  })
  const body = await response.json<{
    count: number
    parts: Array<{
      uid: string
      mpn: string
      symbol_available: boolean
      threed_available: boolean
    }>
  }>()

  expect(response.status).toBe(200)
  expect(body.count).toBe(1)
  expect(body.parts[0]).toMatchObject({
    uid: "fake-generated-lm358",
    mpn: "LM358",
    symbol_available: true,
    threed_available: true,
  })
})

test("lists export formats for parts with CAD assets", async () => {
  const { ky } = await getTestServer()

  const response = await ky.get("v1/export/formats", {
    headers: auth,
    searchParams: { uid: "fake-generated-lm358" },
  })
  const body = await response.json<{
    formats: Array<{ id: string; cad_tool: string; file_type: string }>
  }>()

  expect(response.status).toBe(200)
  expect(body.formats).toContainEqual(
    expect.objectContaining({ id: "kicad_v6", cad_tool: "KiCAD" }),
  )
  expect(body.formats).toContainEqual(
    expect.objectContaining({
      id: "step",
      cad_tool: "STEP",
      file_type: "zip",
    }),
  )
})

test("creates a fake export response", async () => {
  const { ky } = await getTestServer()

  const response = await ky.post("v1/export", {
    headers: auth,
    json: { uid: "fake-generated-lm358", format: "kicad_v6" },
  })
  const body = await response.json<{
    status: string
    uid: string
    download_url: string
  }>()

  expect(response.status).toBe(200)
  expect(body).toMatchObject({ status: "ready", uid: "fake-generated-lm358" })
  expect(body.download_url).toContain("/v1/export/kicad?mpn=LM358")
})

test("creates a fake STEP export response", async () => {
  const { ky } = await getTestServer()

  const response = await ky.post("v1/export", {
    headers: auth,
    json: { uid: "fake-generated-lm358", format: "step" },
  })
  const body = await response.json<{
    status: string
    uid: string
    download_url: string
    format: string
  }>()

  expect(response.status).toBe(200)
  expect(body).toMatchObject({
    status: "ready",
    uid: "fake-generated-lm358",
    format: "step",
  })
  expect(body.download_url).toContain("/v1/export/step?mpn=LM358")
})

test("returns a KiCad zip for export helper", async () => {
  const { ky } = await getTestServer()

  const response = await ky.get("v1/export/kicad", {
    headers: auth,
    searchParams: { mpn: "LM358", version: "6" },
  })
  const bytes = new Uint8Array(await response.arrayBuffer())

  expect(response.status).toBe(200)
  expect(response.headers.get("content-type")).toBe("application/zip")
  expect([...bytes.slice(0, 4)]).toEqual([0x50, 0x4b, 0x03, 0x04])
  expect(new TextDecoder().decode(bytes)).toContain(
    "Synthetic placeholder generated for tests; not vendor CAD.",
  )
  expect(new TextDecoder().decode(bytes)).not.toContain("Package_DIP")
  expect(new TextDecoder().decode(bytes)).not.toContain("DIP8_300")
})

test("returns a STEP zip for export helper", async () => {
  const { ky } = await getTestServer()

  const response = await ky.get("v1/export/step", {
    headers: auth,
    searchParams: { mpn: "LM358" },
  })
  const bytes = new Uint8Array(await response.arrayBuffer())
  const decoded = new TextDecoder().decode(bytes)

  expect(response.status).toBe(200)
  expect(response.headers.get("content-type")).toBe("application/zip")
  expect(response.headers.get("content-disposition")).toBe(
    'attachment; filename="LM358_STEP.zip"',
  )
  expect([...bytes.slice(0, 4)]).toEqual([0x50, 0x4b, 0x03, 0x04])
  expect(decoded).toContain("ISO-10303-21")
  expect(decoded).toContain("DIP8_300.step")
  expect(decoded).toContain("Requested MPN: LM358")
})

test("rejects fake endpoints without a bearer token", async () => {
  const { ky } = await getTestServer()

  const response = await ky.get("v1/parts/search", {
    searchParams: { q: "LM358" },
  })

  expect(response.status).toBe(401)
})
