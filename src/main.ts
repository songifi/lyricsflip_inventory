import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import helmet from "helmet";
import { ValidationPipe } from "@nestjs/common";
import { AllExceptionsFilter } from "utils/exceptions.filter";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { WinstonModule } from "nest-winston";
import { winstonLoggerOptions } from "./logger.config";

import { GlobalExceptionFilter } from './filters/http-exception.filter';
import { Logger } from "winston";

import { AppConfigService } from './config/config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    logger: WinstonModule.createLogger(winstonLoggerOptions),
  });

  app.useGlobalFilters(new GlobalExceptionFilter(app.get(Logger)));

  const { httpAdapter } = app.get(HttpAdapterHost);
  const configService = app.get(AppConfigService);


  app.enableCors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", 
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true, 
    maxAge: 3600,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));


  app.use(helmet());

  const config = new DocumentBuilder()
    .setTitle("Inventory Management System")
    .setDescription("Inventory Management System API")
    .setVersion("1.0")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "JWT",
        description: "Enter JWT token",
        in: "header",
      },
      "access-token"
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  await app.listen(configService.port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
