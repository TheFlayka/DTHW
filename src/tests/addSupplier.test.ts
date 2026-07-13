import { test, expect } from 'bun:test'

// function
import { addSupplier } from '../services/addSupplier'

test('[Add Supplier test] stable work', async () => {
  const result = await addSupplier({
    name: 'TEST',
    willCome: '2026-06-08T03:00:00.000Z',
    willLeave: '2026-06-08T04:00:00.000Z',
    timeSpent: 3600000,
  })
  expect(result.success).toBe(true)
})
// I KNOW! working with real data is bad, but it is just study project, on production it will be different

test('[Add Supplier test] conflict in morning', async () => {
  const result = await addSupplier({
    name: 'TEST',
    willCome: '2026-06-08T02:00:00.000Z',
    willLeave: '2026-06-08T04:00:00.000Z',
    timeSpent: 3600000,
  })
  expect(result.success).toBe(false)
})

test('[Add Supplier test] conflict in night', async () => {
  const result = await addSupplier({
    name: 'TEST',
    willCome: '2026-06-08T03:00:00.000Z',
    willLeave: '2026-06-08T18:00:00.000Z',
    timeSpent: 3600000,
  })
  expect(result.success).toBe(false)
})

test('[Add Supplier test] time spent conflict', async () => {
  const result = await addSupplier({
    name: 'TEST',
    willCome: '2026-06-08T03:00:00.000Z',
    willLeave: '2026-06-08T03:10:00.000Z',
    timeSpent: 3600000,
  })
  expect(result.success).toBe(false)
})
