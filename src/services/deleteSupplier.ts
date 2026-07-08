// prisma
import { prisma } from '../lib/prisma'
// types
import type { IResponse } from '../routes'

export async function deleteSupplier(id: number) {
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

    await prisma.suppliers.delete({ where: { id } })

    return {
      message: 'Supplier was deleted',
      status: 200,
      success: true,
      timestamp: new Date().toISOString(),
    } satisfies IResponse
  } catch (error) {
    console.error(
      `[${new Date().toISOString()} - ERROR] Something is wrong in delete-supplier service: `,
      error,
    )
    return {
      message: 'Error occurred while deleting supplier',
      status: 500,
      success: false,
      timestamp: new Date().toISOString(),
    } satisfies IResponse
  }
}
