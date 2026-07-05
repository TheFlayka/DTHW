// Special functions
import { calculateTimeSpentInDock } from '#shared/calculateTime'

// prisma
import { prisma } from '../lib/prisma'

// types
import { type IResponse, type IResponseWithData } from '../routes'

// Interfaces of response & Slot
interface ISlot {
  canCome: string
  canLeave: string
}

interface IDataOfSlots {
  slots: Array<ISlot>
  timeSpent: number
}

function isIntervalValid(interval: number) {
  if (interval < 0) {
    console.error(`[ERROR] In Databases were founded that interval is less than 0!`)
  }
}

export async function findSlots(countOfBoxes: number, startDate: string, endDate: string) {
  try {
    const time = calculateTimeSpentInDock(countOfBoxes) // get time spent in the dock

    const suppliers = await prisma.suppliers.findMany({
      where: {
        willCome: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      orderBy: {
        willCome: 'asc',
      },
    })
    if (suppliers.length === 0) {
      return {
        message: 'Not found any suppliers between dates, choose any slot!',
        status: 200,
        success: true,
        timestamp: new Date().toISOString(),
      } satisfies IResponse
    } // if we don't have any suppliers, client can choose any time

    const slots: Array<ISlot> = []
    let lastDate: number = 0 // It helps with checking if we reached new day in iteration, so checking window in morning and night will be work!

    // Iteration for getting interval and finding slots
    for (let i = 0; i < suppliers.length; i++) {
      const supplier = suppliers[i]
      if (!supplier) {
        break
      }

      // checking window between start of the day and first supplier
      if (lastDate !== supplier.willCome.getDate()) {
        // if it's true, we check
        const intervalBeforeFirstSupplier =
          supplier.willCome.getTime() -
          new Date(`${supplier.willCome.toISOString().split('T')[0]}T03:00:00.000Z`).getTime()
        if (intervalBeforeFirstSupplier >= time) {
          slots.push({
            canCome: `${supplier.willCome.toISOString().split('T')[0]}T03:00:00.000Z`,
            canLeave: supplier.willCome.toISOString(),
          })
        }
        isIntervalValid(intervalBeforeFirstSupplier)
        lastDate = supplier.willCome.getDate()
        continue
      }

      const previousLeave = supplier.willLeave.getTime()

      // Night checking
      const nextSupplier = suppliers[i + 1]
      if (lastDate !== nextSupplier?.willCome.getDate()) {
        const intervalBeforeNight =
          new Date(`${supplier.willCome.toISOString().split('T')[0]}T17:00:00.000Z`).getTime() -
          previousLeave
        if (intervalBeforeNight >= time) {
          slots.push({
            canCome: supplier.willLeave.toISOString(),
            canLeave: `${supplier.willCome.toISOString().split('T')[0]}T17:00:00.000Z`,
          })
        }
        isIntervalValid(intervalBeforeNight)
        lastDate = supplier.willCome.getDate()
        continue
      }

      const nextCome = nextSupplier.willCome.getTime()
      // main checking
      const mainInterval = nextCome - previousLeave
      if (mainInterval >= time) {
        slots.push({
          canCome: supplier.willLeave.toISOString(),
          canLeave: nextSupplier.willCome.toISOString(),
        })
      }
      isIntervalValid(mainInterval)
      lastDate = supplier.willCome.getDate()
    }

    return {
      message: 'Found available slots!',
      status: 200,
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        slots: slots,
        timeSpent: time,
      },
    } satisfies IResponseWithData<IDataOfSlots>
  } catch (error) {
    console.error(error)
    return {
      message: 'Error occurred while finding available slots',
      status: 500,
      success: false,
      timestamp: new Date().toISOString(),
    } satisfies IResponse
  }
}
