import { prisma } from '../lib/prisma'
import type { IResponse, IResponseWithData, ISupplier } from '../routes'

export async function getSupplier(id: number) {
  try {
    const supplier = await prisma.suppliers.findFirst({
      where: {
        id: id,
      },
    })
    if (!supplier) {
      return {
        message: 'Not found supplier',
        status: 404,
        success: false,
        timestamp: new Date().toISOString(),
      } satisfies IResponse
    }
    const dataSupplier: ISupplier = {
      id: supplier.id,
      name: supplier.name,
      willCome: supplier.willCome.toISOString(),
      willLeave: supplier.willLeave.toISOString(),
      timeSpent: supplier.timeSpent,
    }

    return {
      message: 'Found supplier',
      status: 200,
      success: true,
      timestamp: new Date().toISOString(),
      data: dataSupplier,
    } satisfies IResponseWithData<ISupplier>
  } catch (error) {
    console.error(error)
    return {
      message: 'Error occurred while getting supplier',
      status: 500,
      success: false,
      timestamp: new Date().toISOString(),
    } satisfies IResponse
  }
}
