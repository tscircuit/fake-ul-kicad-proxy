import { expect, test } from "bun:test"
import { ULKiCadProxyServer } from "../lib/index"

test("serves the winterspec health endpoint", async () => {
  const server = new ULKiCadProxyServer()
  await server.start()

  const response = await fetch(`${server.url}/health`)

  expect(response.status).toBe(200)
  expect(await response.json()).toEqual({ ok: true })
})
