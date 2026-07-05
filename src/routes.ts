// Hono
import { Context, Hono } from 'hono'

// Services
import { findSlots } from './services/findSlots'

const app = new Hono()

enum HTTPCodes {
  OK = 200,
  BAD_REQUEST = 400,
  NOT_FOUND = 404,
  CREATED = 201,
  INTERNAL_SERVER_ERROR = 500,
}

export interface IResponse {
  message: string
  status: HTTPCodes
  success: boolean
  timestamp: string
}

export interface IResponseWithData<T> extends IResponse {
  data: T
}

app.get('/slots', async (c: Context) => {
  // get count of boxes from query with checking and parsing it
  const countString = c.req.query('countOfBoxes')
  if (!countString) {
    return c.json(
      {
        message: 'Not found query of count of boxes',
        status: 400,
        success: false,
        timestamp: new Date().toISOString(),
      } satisfies IResponse,
      400,
    )
  }
  const countOfBoxes = parseInt(countString, 10)
  if (isNaN(countOfBoxes) || countOfBoxes < 1) {
    return c.json(
      {
        message: 'Count of boxes less than 1 or it is not a number',
        status: 400,
        success: false,
        timestamp: new Date().toISOString(),
      } satisfies IResponse,
      400,
    )
  }

  const { startDate, endDate } = c.req.query()
  if (!startDate || !endDate) {
    return c.json(
      {
        message: 'Not found startDate and endDate in queries',
        status: 400,
        success: false,
        timestamp: new Date().toISOString(),
      } satisfies IResponse,
      400,
    )
  }

  const currentDate = new Date()

  if (
    new Date(startDate).getDate() < currentDate.getDate() ||
    new Date(endDate).getDate() < currentDate.getDate() ||
    new Date(endDate).getTime() > new Date().setMonth(currentDate.getMonth() + 3) ||
    new Date(startDate).getTime() > new Date().setMonth(currentDate.getMonth() + 3) ||
    new Date(startDate).getTime() > new Date(endDate).getTime()
  ) {
    return c.json(
      {
        message: 'Queries is not good. Please, check dates!',
        status: 400,
        success: false,
        timestamp: new Date().toISOString(),
      } satisfies IResponse,
      400,
    )
  }

  const result = await findSlots(countOfBoxes, startDate, endDate)
  return c.json(result, result.status)
})

export default app
