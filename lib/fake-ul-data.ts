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

export interface FakeExportFormat {
  id: string
  name: string
  cad_tool: string
  version: string
  file_type: string
  requires_symbol: boolean
  requires_footprint: boolean
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

export const supportedExportFormats: FakeExportFormat[] = [
  {
    id: "kicad_v6",
    name: "KiCad v6+",
    cad_tool: "KiCAD",
    version: "6",
    file_type: "zip",
    requires_symbol: true,
    requires_footprint: true,
  },
  {
    id: "kicad_v7",
    name: "KiCad v7+",
    cad_tool: "KiCAD",
    version: "7",
    file_type: "zip",
    requires_symbol: true,
    requires_footprint: true,
  },
  {
    id: "kicad_sym",
    name: "KiCad schematic symbol",
    cad_tool: "KiCAD",
    version: "6+",
    file_type: "kicad_sym",
    requires_symbol: true,
    requires_footprint: false,
  },
]

export function getAvailableExportFormats(part: FakePart): FakeExportFormat[] {
  return supportedExportFormats.filter((format) => {
    if (format.requires_symbol && !part.symbol_available) {
      return false
    }

    if (format.requires_footprint && !part.footprint_available) {
      return false
    }

    return true
  })
}

export function findExportFormat(id: string): FakeExportFormat | undefined {
  return supportedExportFormats.find((format) => format.id === id)
}

export function findPartByUid(uid: string): FakePart | undefined {
  return fakeParts.find((part) => part.uid.toLowerCase() === uid.toLowerCase())
}

export function findPartByMpn(mpn: string): FakePart | undefined {
  return fakeParts.find((part) => part.mpn.toLowerCase() === mpn.toLowerCase())
}
