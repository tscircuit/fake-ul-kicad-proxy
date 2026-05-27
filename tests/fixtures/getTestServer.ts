import { afterEach } from "bun:test"
import ky from "ky"
import { ULKiCadProxyServer } from "../../lib/index"

type TestApi = ReturnType<typeof ky.create>
export type TestKy = TestApi
export type TestServer = ULKiCadProxyServer
export type TestServerContext = {
  server: TestServer
  ky: TestKy
}

const testServers = new Set<ULKiCadProxyServer>()

afterEach(async () => {
  await Promise.all([...testServers].map((server) => server.stop()))
  testServers.clear()
})

export async function getTestServer(): Promise<TestServerContext> {
  const server = new ULKiCadProxyServer()
  await server.start()
  testServers.add(server)

  return {
    server,
    ky: ky.create({
      prefix: server.url,
      throwHttpErrors: false,
    }),
  }
}
