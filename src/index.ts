// Check ENV variables
import { PORT } from './shared/env.js'

// Hono
import { Hono } from 'hono'
import type { HonoBase } from 'hono/hono-base'
const app: HonoBase = new Hono()

// Main route
app.get('/', (c) => c.text('It is API of DTHW Backend!'))

export default {
  port: PORT,
  fetch: app.fetch,
}
