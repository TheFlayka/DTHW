import { test, expect } from 'bun:test'

// Function
import { parseIntFunction } from '#shared/parseIntFunction'

test('[Parse Int Function] stable work', () => {
  const result = parseIntFunction('3')
  expect(result).toBe(3)
})

test('[Parse Int Function] false(it is NaN)', () => {
  const result = parseIntFunction('test')
  expect(result).toBe(false)
})
