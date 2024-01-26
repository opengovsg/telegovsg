import { Command, Ctx, Start, Update } from 'nestjs-telegraf'
import { UserGuard } from '../user/guards/user.guard'
import { UseGuards } from '@nestjs/common'
import { UserContext } from '../user/user-context'

@Update()
export class BotUpdate {
  constructor() {}
  @Start()
  @UseGuards(UserGuard)
  async onStart(@Ctx() ctx: UserContext) {
    const verifiedMessage = [`You are verified with the following details:`]
    for (const poDetail of ctx.session.poDetails) {
      verifiedMessage.push(
        `<b>Agency: </b>${poDetail.agency_name}\n<b>Department: </b>${poDetail.department_name}\n<b>Title: </b>${poDetail.employment_title}`,
      )
    }
    verifiedMessage.push(`\n/logout to log out`)
    await ctx.replyWithHTML(
      `<b>Authenticated Public Officer</b>\n\n${verifiedMessage.join('\n')}`,
    )
  }

  @Command('logout')
  @UseGuards(UserGuard)
  async onLogout(@Ctx() ctx: UserContext) {
    ctx.session = undefined
    await ctx.replyWithHTML('You have successfully logged out.')
  }
}
