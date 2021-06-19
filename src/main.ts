import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { BinanceService } from './binance/binance.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Crypto Crawler')
    .setDescription('The Crypto Crawler API description')
    .setVersion('1.0')
    .addTag('crypto_crawler')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);

  // const binanceService = app.get(BinanceService);
  // binanceService.openTradeStream();
}
bootstrap().then((r) => r);
