// import { NestFactory } from '@nestjs/core';
// import { ValidationPipe } from '@nestjs/common';
// import { AppModule } from './app.module';
// import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
// import { NestExpressApplication } from '@nestjs/platform-express';
// import { join, resolve } from 'path';

// async function bootstrap() {
//   const allowedOrigins = [
//     'http://localhost:5173',
//   ];

//   const app = await NestFactory.create<NestExpressApplication>(AppModule);

//   app.enableCors({
//     origin: (origin, callback) => {
//       const allowedOrigins = [
//         'http://localhost:5173',
//       ];

//       // ❌ Nếu không có origin → chặn (truy cập trực tiếp từ browser)
//       if (!origin) {
//         return callback(
//           new Error('CORS blocked: Direct browser access is not allowed.'),
//         );
//       }

//       // ✔ Domain hợp lệ → cho phép
//       if (allowedOrigins.includes(origin)) {
//         return callback(null, true);
//       }

//       // ❌ Domain không hợp lệ → chặn
//       return callback(new Error('Not allowed by CORS'));
//     },
//     credentials: true,
//   });

//   app.useStaticAssets(resolve('uploads'), {
//     prefix: '/uploads',
//   });

//   // ✅ Global pipes
//   app.useGlobalPipes(
//     new ValidationPipe({
//       whitelist: true,
//       transform: true,
//     }),
//   );

//   // ✅ Swagger setup
//   const config = new DocumentBuilder()
//     .setTitle('BookShop API')
//     .setDescription('API documentation for the book store platform')
//     .setVersion('1.0')
//     .addBearerAuth()
//     .build();

//   const document = SwaggerModule.createDocument(app, config);
//   SwaggerModule.setup('api', app, document);

//   const PORT = process.env.PORT ?? 3212;
//   await app.listen(PORT, '0.0.0.0');

//   console.log(`🚀 Server is running on http://localhost:${PORT}`);
//   console.log(`📚 Swagger docs available at http://localhost:${PORT}/api`);
// }
// bootstrap();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const allowedOrigins = [
    'http://localhost:5173',
    'https://localgo.onrender.com',
  ];

  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  const config = new DocumentBuilder()
    .setTitle('E-Learning API')
    .setDescription('API documentation for the e-learning platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const PORT = process.env.PORT ?? 3212;
  await app.listen(PORT, '0.0.0.0');

  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📚 Swagger docs available at http://localhost:${PORT}/api`);
}
bootstrap();
