export interface FakePart {
  uid: string
  mpn: string
  manufacturer: string
  description: string
  symbol_available: boolean
  footprint_available: boolean
  package: string
  pin_count: number
}

export const fakeParts: FakePart[] = [
  {
    uid: "fake-generated-lm358",
    mpn: "LM358",
    manufacturer: "Fixture Manufacturer",
    description: "Generated test record for a dual op amp style part",
    symbol_available: true,
    footprint_available: true,
    package: "generated-through-hole-8",
    pin_count: 8,
  },
  {
    uid: "fake-generated-ne555p",
    mpn: "NE555P",
    manufacturer: "Fixture Manufacturer",
    description: "Generated test record for a timer style part",
    symbol_available: true,
    footprint_available: true,
    package: "generated-through-hole-8",
    pin_count: 8,
  },
  {
    uid: "fake-generated-tps5430",
    mpn: "TPS5430",
    manufacturer: "Fixture Manufacturer",
    description: "Generated test record for a regulator style part",
    symbol_available: true,
    footprint_available: false,
    package: "generated-surface-mount-8",
    pin_count: 8,
  },
]

export const supportedExportFormats = [
  {
    id: "kicad_v6",
    name: "KiCad v6+",
    cad_tool: "KiCAD",
    version: "6",
    file_type: "zip",
  },
  {
    id: "kicad_v7",
    name: "KiCad v7+",
    cad_tool: "KiCAD",
    version: "7",
    file_type: "zip",
  },
]

export function findPartByUid(uid: string): FakePart | undefined {
  return fakeParts.find((part) => part.uid.toLowerCase() === uid.toLowerCase())
}

export function findPartByMpn(mpn: string): FakePart | undefined {
  return fakeParts.find((part) => part.mpn.toLowerCase() === mpn.toLowerCase())
}
