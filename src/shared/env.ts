// Port var
const PORT = parseInt(Bun.env.PORT || '3000', 10)
if (isNaN(PORT) || PORT < 0 || PORT > 65535) {
  console.error(`[${new Date().toISOString()} - CRITICAL] Invalid PORT value: ${Bun.env.PORT}`)
  process.exit(1)
}

// Database URL var
type PostgresUrl = `postgresql://${string}:${string}@${string}:${number}/${string}?schema=${string}`

const databaseUrl = Bun.env.DATABASE_URL
if (!databaseUrl) {
  console.error(`[${new Date().toISOString()} - CRITICAL] DATABASE_URL is not set.`)
  process.exit(1)
}

function isPostgresUrl(url: string): url is PostgresUrl {
  try {
    const parsedUrl = new URL(url)
    return (
      parsedUrl.protocol === 'postgresql:' &&
      parsedUrl.pathname.startsWith('/') &&
      parsedUrl.searchParams.has('schema') &&
      parsedUrl.host.includes(':') &&
      parsedUrl.href.includes(`${parsedUrl.username}:${parsedUrl.password}@`)
    )
  } catch {
    return false
  }
}

if (!isPostgresUrl(databaseUrl)) {
  console.error(
    `[${new Date().toISOString()} - CRITICAL] Invalid DATABASE_URL value: ${databaseUrl}`,
  )
  process.exit(1)
}

export { PORT, databaseUrl }
