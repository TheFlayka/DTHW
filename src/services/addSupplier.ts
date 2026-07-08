// prisma
import { prisma } from '../lib/prisma'
// types
import type { IResponse } from '../routes'
import type { IBodySupplier } from '#shared/types'

export async function addSupplier(body: IBodySupplier) {
  try {
    // Algorithm:
    // we find the nearest supplier who will come before new supplier, we check leaving of leftSupplier and coming new supplier and we must be sure that there is not any conflicts
    // right supplier who will come after new supplier, we check his coming with new supplier leaving and we must be sure that there is not any conflicts

    // Checking left supplier
    const leftSupplier = await prisma.suppliers.findFirst({
      where: {
        willCome: {
          lte: body.willCome,
          gte: `${body.willCome.split('T')[0]}T00:00:00.000Z`,
        },
      },
      orderBy: {
        willCome: 'desc',
      },
    })
    if (!leftSupplier) {
      // morning check
      if (body.willCome < `${body.willCome.split('T')[0]}T03:00:00.000Z`) {
        return {
          message: 'Supplier cannot come earlier than dock open',
          status: 400,
          success: false,
          timestamp: new Date().toISOString(),
        } satisfies IResponse
      }
    } else {
      if (leftSupplier.willLeave > new Date(body.willCome)) {
        return {
          message: 'Unfortunately, supplier cannot come because of other suppliers',
          status: 400,
          success: false,
          timestamp: new Date().toISOString(),
        } satisfies IResponse
      }
    }

    // Checking right supplier
    const rightSupplier = await prisma.suppliers.findFirst({
      where: {
        willCome: {
          gte: body.willCome,
          lte: `${body.willCome.split('T')[0]}T23:59:59.000Z`,
        },
      },
      orderBy: {
        willCome: 'asc',
      },
    })
    if (!rightSupplier) {
      if (body.willLeave > `${body.willCome.split('T')[0]}T17:00:00.000Z`) {
        return {
          message: 'Supplier cannot come later than dock close',
          status: 400,
          success: false,
          timestamp: new Date().toISOString(),
        } satisfies IResponse
      }
    } else {
      if (new Date(body.willLeave) > rightSupplier.willCome) {
        return {
          message: 'Unfortunately, supplier cannot come because of other suppliers',
          status: 400,
          success: false,
          timestamp: new Date().toISOString(),
        } satisfies IResponse
      }
    }

    if (new Date(body.willLeave).getTime() - new Date(body.willCome).getTime() < body.timeSpent) {
      return {
        message: 'Supplier cannot be added because time spent in dock more than window allow',
        status: 400,
        success: false,
        timestamp: new Date().toISOString(),
      } satisfies IResponse
    }

    await prisma.suppliers.create({
      data: {
        ...body,
        createdAt: new Date().toISOString(),
      },
    })

    return {
      message: 'New supplier was added in databases',
      status: 201,
      success: true,
      timestamp: new Date().toISOString(),
    } satisfies IResponse
  } catch (error) {
    console.error(
      `[${new Date().toISOString()} - ERROR] Something is wrong in add-supplier service: `,
      error,
    )
    return {
      message: 'Error occurred while adding supplier',
      status: 500,
      success: false,
      timestamp: new Date().toISOString(),
    } satisfies IResponse
  }
}
