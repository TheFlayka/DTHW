export function parseIntFunction(query: string | undefined) {
  // Check if we don't get query
  if (!query) {
    return false
  }
  const queryNumber = parseInt(query, 10) // parsing
  // check if query is NaN
  if (isNaN(queryNumber)) {
    return false
  }

  return queryNumber
}
