import { join } from "node:path"
import { createDatabase, type DbClient } from "./db/db-client"
import type { ULKiCadProxyServerOptions } from "./types"
import type { Middleware, WinterSpecRouteBundle } from "winterspec"
import { createWinterSpecBundleFromDir } from "winterspec/adapters/node"

export type { ULKiCadProxyServerOptions } from "./types"

export class ULKiCadProxyServer {
  readonly hostname: string
  readonly port: number
  server: Bun.Server<Record<string, unknown>> | undefined
  serverUrl: string | undefined
  db: DbClient
  private winterspecBundle: WinterSpecRouteBundle | undefined

  constructor(options: ULKiCadProxyServerOptions = {}) {
    this.hostname = options.hostname ?? "127.0.0.1"
    this.port = options.port ?? 0
    this.db = createDatabase()
  }

  get url(): string {
    if (this.serverUrl == null) {
      throw new Error("ULKiCadProxyServer has not been started")
    }

    return this.serverUrl
  }

  async start(): Promise<string> {
    if (this.server != null) {
      return this.url
    }

    this.server = Bun.serve({
      hostname: this.hostname,
      port: this.port,
      fetch: this.handleRequest,
    })
    this.serverUrl = `http://${this.hostname}:${this.server.port}`

    return this.url
  }

  async stop(): Promise<void> {
    this.server?.stop(true)
    this.server = undefined
    this.serverUrl = undefined
    this.db.reset()
  }

  handleRequest = async (request: Request): Promise<Response> => {
    const winterspecBundle = await this.getWinterSpecBundle()

    return winterspecBundle.makeRequest(request, {
      middleware: [this.getDbMiddleware()],
    })
  }

  getUrl(): string {
    return this.url
  }

  private async getWinterSpecBundle(): Promise<WinterSpecRouteBundle> {
    this.winterspecBundle ??= await createWinterSpecBundleFromDir(
      join(import.meta.dir, "../routes"),
    )

    return this.winterspecBundle
  }

  private getDbMiddleware(): Middleware {
    return async (req, ctx, next) => {
      ;(ctx as { db?: DbClient }).db = this.db

      return next(req, ctx)
    }
  }
}
