import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: true,
    }),
  );
  const port = process.env.PORT || 10000;
  const address =
    process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

  app.enableCors();
  await app.listen(port, address, (err, address) => {
    if (err) {
      console.error('Error starting server:', err);
      process.exit(1);
    }
    console.log(`Server listening at ${address} on port ${port}`);
  });
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
