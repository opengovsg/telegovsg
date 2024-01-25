import { Client, ClientConfig } from 'pg'

export class NoticeLoggingClient extends Client {
  constructor(config?: string | ClientConfig) {
    super(config)
    this.on('notice', ({ message }) => console.log(message))
  }
}
