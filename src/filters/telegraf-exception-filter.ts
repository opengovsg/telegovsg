import { Catch, ExceptionFilter, Logger } from '@nestjs/common'
import { TelegrafException } from 'nestjs-telegraf'

@Catch(TelegrafException)
export class TelegrafExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('TelegrafException')

  async catch(exception: TelegrafException): Promise<void> {
    this.logger.log(exception.message)
  }

  // If it is preferable to send the error message via telegram to the user, the below version of the catch function can be used instead
  // async catch(
  //   exception: TelegrafException,
  //   host: ArgumentsHost,
  // ): Promise<void> {
  //   const telegrafHost = TelegrafArgumentsHost.create(host);
  //   const ctx = telegrafHost.getContext<Context>();
  //
  //   await ctx.replyWithHTML(`<b>Error</b>: ${exception.message}`);
  // }
}
