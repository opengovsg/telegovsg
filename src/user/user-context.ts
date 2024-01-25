import { Context } from 'telegraf'

export type UserContext = Context & {
  session?: {
    name: string
    verified_date: Date
    poDetails: {
      agency_name: string
      department_name: string
      employment_type: string
      employment_title: string
    }[]
  }
}
