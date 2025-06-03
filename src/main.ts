import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import helmet from "helmet";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS configuration
  app.enableCors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // Configure based on environment
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true, // Enable if you need to send cookies
    maxAge: 3600, // Cache preflight requests for 1 hour
  });

  // Security headers
  app.use(helmet()); // Add helmet for security headers

  await app.listen(3000);
}
bootstrap();
