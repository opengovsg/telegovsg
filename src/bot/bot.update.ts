import { Start, Update } from 'nestjs-telegraf';

@Update()
export class BotUpdate {
  @Start()
  onStart(): string {
    return 'hello';
  }
}
