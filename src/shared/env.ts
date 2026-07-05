// Port var
const portNum = parseInt(Bun.env.PORT || '3000', 10)
if (isNaN(portNum) || portNum < 0 || portNum > 65535) {
  console.error(`[CRITICAL, ${new Date().toISOString()}] Invalid PORT value: ${Bun.env.PORT}`)
  process.exit(1)
}
export { portNum }
