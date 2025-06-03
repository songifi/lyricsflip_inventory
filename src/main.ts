import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import helmet from "helmet";
import { ValidationPipe } from "@nestjs/common";
import { AllExceptionsFilter } from "utils/exceptions.filter";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const { httpAdapter } = app.get(HttpAdapterHost);

  // CORS configuration
  app.enableCors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // Configure based on environment
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true, // Enable if you need to send cookies
    maxAge: 3600, // Cache preflight requests for 1 hour
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));
  // Security headers
  app.use(helmet()); // Add helmet for security headers

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

  await app.listen(3000);
}
bootstrap();
