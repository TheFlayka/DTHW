// Hono
import { Context, Hono } from 'hono'
const app = new Hono()

// Services
import { findSlots } from './services/findSlots'
import { addSupplier } from './services/addSupplier'
import { getSupplier } from './services/getSupplier'
import { deleteSupplier } from './services/deleteSupplier'

// Shares function
import { parseIntFunction } from '#shared/parseIntFunction'

//types
import type { IBodySupplier } from '#shared/types'

// Special types for response object
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
} // It is necessary for special response with data

function checkDates(firstDate: string, secondDate: string) {
  return (
    new Date(secondDate).getTime() > new Date().setMonth(new Date().getMonth() + 3) ||
    new Date(firstDate).getTime() > new Date().setMonth(new Date().getMonth() + 3) || // StartDate and EndDate cannot be later than 3 month since current month
    new Date(firstDate).getTime() > new Date(secondDate).getTime() // StartDate cannot be later than endDate
  )
}

// Routes
// Find slots in db
app.get('/slots', async (c: Context) => {
  // get count of boxes from query with checking and parsing it
  const countOfBoxes = parseIntFunction(c.req.query('countOfBoxes'))
  if (countOfBoxes === false)
    return c.json(
      {
        message: 'Query not found or it is not a number',
        status: 400,
        success: false,
        timestamp: new Date().toISOString(),
      } satisfies IResponse,
      400,
    )
  // Count of boxes can't be less than one
  if (countOfBoxes < 1) {
    return c.json(
      {
        message: 'Count of boxes less than 1',
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

  if (
    new Date(startDate).getDate() < new Date().getDate() ||
    new Date(endDate).getDate() < new Date().getDate() || // StartDate and EndDate cannot be earlier than current date
    checkDates(startDate, endDate)
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

app.post('/slots', async (c: Context) => {
  // checking body before adding supplier into db
  // (validator will be add soon)
  const body: IBodySupplier = await c.req.json()
  if (
    checkDates(body.willCome, body.willLeave) ||
    new Date(body.willCome).getDate() !== new Date(body.willLeave).getDate() ||
    new Date(body.willCome).getMonth() !== new Date(body.willLeave).getMonth() ||
    new Date(body.willCome).getFullYear() !== new Date(body.willLeave).getFullYear()
  ) {
    return c.json(
      {
        message: 'WillCome and WillLeave is not good, please check data!',
        status: 400,
        success: false,
        timestamp: new Date().toISOString(),
      } satisfies IResponse,
      400,
    )
  }

  const result = await addSupplier(body)
  return c.json(result, result.status)
})

app.get('/slots/:id', async (c: Context) => {
  const id = parseIntFunction(c.req.param('id'))
  if (id === false) {
    return c.json(
      {
        message: 'Param ID is not found or it is not a number',
        status: 400,
        success: false,
        timestamp: new Date().toISOString(),
      } satisfies IResponse,
      400,
    )
  }

  const result = await getSupplier(id)
  return c.json(result, result.status)
})

app.delete('/slots/:id', async (c: Context) => {
  const id = parseIntFunction(c.req.param('id'))
  if (id === false) {
    return c.json(
      {
        message: 'Param ID is not found or it is not a number',
        status: 400,
        success: false,
        timestamp: new Date().toISOString(),
      } satisfies IResponse,
      400,
    )
  }

  const result = await deleteSupplier(id)
  return c.json(result, result.status)
})

export default app
