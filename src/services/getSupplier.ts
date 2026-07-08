// prisma
import { prisma } from '../lib/prisma'
// types
import type { IResponse, IResponseWithData } from '../routes'
import type { ISupplier } from '#shared/types'

export async function getSupplier(id: number) {
  try {
    const supplier = await prisma.suppliers.findFirst({
      where: { id },
    })
    if (!supplier) {
      return {
        message: 'Not found supplier',
        status: 404,
        success: false,
        timestamp: new Date().toISOString(),
      } satisfies IResponse
    }
    const { willCome, willLeave, ...otherInformation } = supplier
    const dataSupplier: ISupplier = {
      ...otherInformation,
      willCome: willCome.toISOString(),
      willLeave: willLeave.toISOString(),
    } // TS require to set string(Prisma return Date like in schemas, but for response it has to be ISO string)

    return {
      message: 'Found supplier',
      status: 200,
      success: true,
      timestamp: new Date().toISOString(),
      data: dataSupplier,
    } satisfies IResponseWithData<ISupplier>
  } catch (error) {
    console.error(
      `[${new Date().toISOString()} - ERROR] Something is wrong in get-supplier service: `,
      error,
    )
    return {
      message: 'Error occurred while getting supplier',
      status: 500,
      success: false,
      timestamp: new Date().toISOString(),
    } satisfies IResponse
  }
}
