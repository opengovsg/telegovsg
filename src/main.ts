import { appPromise } from './app'

async function bootstrap() {
  const app = await appPromise
  app.listen(3000)
}
bootstrap()
