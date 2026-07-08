export interface IBodySupplier {
  name: string
  willCome: string
  willLeave: string
  timeSpent: number
}

export interface ISupplier extends IBodySupplier {
  id: number
}
