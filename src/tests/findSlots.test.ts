import { test, expect } from 'bun:test'

// function
import { findSlots } from '../services/findSlots'

test('[Find Slots test] stable work', async () => {
  const result = await findSlots(10, '2026-06-08T00:00:00.000Z', '2026-06-09T23:59:59.00Z')
  expect(result.data?.slots).toEqual([
    { canCome: '2026-06-08T03:00:00.000Z', canLeave: '2026-06-08T04:00:00.000Z' },
    { canCome: '2026-06-08T05:30:00.000Z', canLeave: '2026-06-08T17:00:00.000Z' },
    { canCome: '2026-06-09T05:31:00.000Z', canLeave: '2026-06-09T07:00:00.000Z' },
    { canCome: '2026-06-09T12:30:00.000Z', canLeave: '2026-06-09T16:00:00.000Z' },
  ])
})
