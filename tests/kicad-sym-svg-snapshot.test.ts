import "bun-match-svg"
import { expect, test } from "bun:test"
import { convertCircuitJsonToSchematicSvg } from "circuit-to-svg"
import { KicadSymbolToCircuitJsonConverter } from "kicad-to-circuit-json"
import { getTestServer } from "./fixtures/getTestServer"

const auth = {
  authorization: "Bearer test-token",
}

function renderKiCadSymbolToSvg(
  fileName: string,
  kicadSymbolSource: string,
  expectedPinCount: number,
): string {
  const converter = new KicadSymbolToCircuitJsonConverter()
  converter.addFile(fileName, kicadSymbolSource)
  converter.runUntilFinished()

  const circuitJson = converter.getOutput()

  expect(converter.getWarnings()).toEqual([])
  expect(
    circuitJson.some((element) => element.type === "schematic_component"),
  ).toBe(true)
  expect(
    circuitJson.filter((element) => element.type === "schematic_port"),
  ).toHaveLength(expectedPinCount)
  expect(circuitJson.some((element) => element.type === "schematic_rect")).toBe(
    true,
  )

  return convertCircuitJsonToSchematicSvg(circuitJson, {
    height: 400,
    includeVersion: false,
    width: 800,
  })
}

test("renders an svg snapshot from the KiCad symbol helper", async () => {
  const { ky } = await getTestServer()

  const response = await ky.get("v1/export/kicad_sym", {
    headers: auth,
    searchParams: { mpn: "TPS5430" },
  })
  const body = await response.text()

  expect(response.status).toBe(200)

  const svg = renderKiCadSymbolToSvg("TPS5430.kicad_sym", body, 8)

  await expect(svg).toMatchSvgSnapshot(import.meta.path, "tps5430")
})
