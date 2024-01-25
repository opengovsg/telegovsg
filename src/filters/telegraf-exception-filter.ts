import { Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { TelegrafException } from 'nestjs-telegraf';

@Catch(TelegrafException)
export class TelegrafExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('TelegrafException');

  async catch(exception: TelegrafException): Promise<void> {
    this.logger.log(exception.message);
    // const telegrafHost = TelegrafArgumentsHost.create(host);
    // const ctx = telegrafHost.getContext<Context>();
    //
    // await ctx.replyWithHTML(`<b>Error</b>: ${exception.message}`);
  }
}
