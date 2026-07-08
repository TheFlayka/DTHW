// Check ENV variables
import { PORT } from './shared/env.js'

// Hono
import { Hono } from 'hono'
import type { HonoBase } from 'hono/hono-base'
const app: HonoBase = new Hono()

// Routes of project
import BaseRoutes from './routes.js'
app.route('/api', BaseRoutes)

// Main route
app.get('/', (c) => c.text('It is API of DTHW Backend!'))

export default {
  port: PORT,
  fetch: app.fetch,
}
