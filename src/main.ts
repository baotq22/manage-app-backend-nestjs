import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { ValidationPipe } from "@nestjs/common"

async function bootstrap() {
    const app = await NestFactory.create(AppModule)
    const PORT = 3001

    app.useGlobalPipes(new ValidationPipe())
    app.enableCors()

    await app.listen(PORT, () => {
        console.log(`^^Connect Successfully on port ${PORT}`)
    })
}
bootstrap()
