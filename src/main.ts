import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validación con Class Validator
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true
  }));

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
