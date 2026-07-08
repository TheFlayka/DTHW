// prisma
import { prisma } from '../lib/prisma'
// Shared function
import { calculateTimeSpentInDock } from '#shared/calculateTime'
// types
import { type IResponse, type IResponseWithData } from '../routes'

// Interfaces of Slot
interface ISlot {
  canCome: string
  canLeave: string
}

interface IDataOfSlots {
  slots: Array<ISlot>
  timeSpent: number
}

// If our service find that interval less than 0(minus), it is bad data, so it is necessary to fix that in db!
function isIntervalValid(interval: number, id1: number, id2?: number) {
  if (interval < 0) {
    console.error(
      `[${new Date().toISOString()} - ERROR] In Databases were founded that interval is less than 0! \n 
      ID of first supplier: ${id1} \n
      ID of second supplier: ${id2 ? id2 : 'it is morning/night'}
      `,
    )
  }
}

export async function findSlots(countOfBoxes: number, startDate: string, endDate: string) {
  try {
    const time = calculateTimeSpentInDock(countOfBoxes) // get time spent in the dock

    // Getting all suppliers between startDate and endDAte
    const suppliers = await prisma.suppliers.findMany({
      where: {
        willCome: {
          gte: `${startDate.split('T')[0]}T00:00:00.000Z`,
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

    // Iteration for finding available slots
    for (let i = 0; i < suppliers.length; i++) {
      const supplier = suppliers[i]
      if (!supplier) {
        break
      }

      // checking window between start of the day and first supplier
      if (lastDate !== supplier.willCome.getDate()) {
        const intervalBeforeFirstSupplier =
          supplier.willCome.getTime() -
          new Date(`${supplier.willCome.toISOString().split('T')[0]}T03:00:00.000Z`).getTime()
        if (intervalBeforeFirstSupplier >= time) {
          slots.push({
            canCome: `${supplier.willCome.toISOString().split('T')[0]}T03:00:00.000Z`,
            canLeave: supplier.willCome.toISOString(),
          })
        }
        isIntervalValid(intervalBeforeFirstSupplier, supplier.id)
        lastDate = supplier.willCome.getDate()
        continue
      }

      const previousLeave = supplier.willLeave.getTime() // first supplier for checking interval

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
        isIntervalValid(intervalBeforeNight, supplier.id)
        lastDate = supplier.willCome.getDate()
        continue
      }

      const nextCome = nextSupplier.willCome.getTime() // second supplier for checking interval
      // main checking
      const mainInterval = nextCome - previousLeave
      if (mainInterval >= time) {
        slots.push({
          canCome: supplier.willLeave.toISOString(),
          canLeave: nextSupplier.willCome.toISOString(),
        })
      }
      isIntervalValid(mainInterval, supplier.id, nextSupplier.id)
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
    console.error(
      `[${new Date().toISOString()} - ERROR] Something is wrong in find-slots service: `,
      error,
    )
    return {
      message: 'Error occurred while finding available slots',
      status: 500,
      success: false,
      timestamp: new Date().toISOString(),
    } satisfies IResponse
  }
}
