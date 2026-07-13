import { test, expect } from 'bun:test'

// Function
import { calculateTimeSpentInDock } from '#shared/calculateTime'

test('[Calculate Time test] stable work', () => {
  const result = calculateTimeSpentInDock(10)
  expect(result).toBe(3600000)
})

test('[Calculate Time test] border test (min)', () => {
  const result = calculateTimeSpentInDock(1)
  expect(result).toBe(900000)
})
test('[Calculate Time test] border test (max)', () => {
  const result = calculateTimeSpentInDock(120)
  expect(result).toBe(36600000)
})

test('[Calculate Time test] false test (more)', () => {
  const result = calculateTimeSpentInDock(1000)
  expect(result).toBe(0)
})

test('[Calculate Time test] false test (less)', () => {
  const result = calculateTimeSpentInDock(0)
  expect(result).toBe(0)
})
