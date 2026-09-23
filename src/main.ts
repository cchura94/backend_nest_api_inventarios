import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //INI: habilitando swagger
  const config = new DocumentBuilder()
    .setTitle('Proyecto Inventarios')
    .setDescription('Proyecto backend con Nest')
    .setVersion('1.0')
    .addTag('nest')
    .build();

    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, documentFactory);
  //FIN: swagger

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
