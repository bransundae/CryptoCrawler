import { Controller, Get, Param, Query } from '@nestjs/common';
import { BinanceService } from '../binance/binance.service';
import { ApiImplicitParam } from '@nestjs/swagger/dist/decorators/api-implicit-param.decorator';
import { ApiImplicitQuery } from '@nestjs/swagger/dist/decorators/api-implicit-query.decorator';
import { MarketsService } from './markets.service';

@Controller('markets')
export class MarketsController {
  constructor(
    private binanceService: BinanceService,
    private marketService: MarketsService,
  ) {}

  @ApiImplicitQuery({ name: 'limit', required: false })
  @Get('currentTickerPrice/:symbol')
  async getCurrentTickerPrice(@Param('symbol') symbol: string) {
    return this.binanceService.getPriceTicker(symbol).then((result) => result);
  }

  @ApiImplicitQuery({ name: 'limit', required: false })
  @Get('orderBookDepth/:symbol')
  async getOrderBookDepth(
    @Param('symbol') symbol: string,
    @Query('limit') limit?: number,
  ) {
    return this.binanceService.getOrderBookDepth(symbol, limit);
  }

  @ApiImplicitParam({ name: 'startTime', required: false })
  @ApiImplicitParam({ name: 'endTime', required: false })
  @ApiImplicitQuery({ name: 'limit', required: false })
  @Get('klines/:symbol')
  async getKlines(
    @Param('symbol') symbol: string,
    @Query('interval') interval: string,
    @Query('startTime') startTime?: number,
    @Query('endTime') endTime?: number,
    @Query('limit') limit?: number,
  ) {
    return this.binanceService
      .getKLines(symbol, interval, startTime, endTime, limit)
      .then((result) => {
        return this.marketService.insertKlines(result).then((saved) => saved);
      });
  }

  @ApiImplicitQuery({ name: 'currentTime', required: false })
  @Get('MA/:symbol')
  async get5MA(
    @Param('symbol') symbol: string,
    @Query('interval') interval: string,
    @Query('timePeriods') timePeriods: number,
    @Query('currentTime') currentTime?: number,
  ) {
    if (currentTime == null) {
      currentTime = Date.now();
    }

    return this.marketService
      .calculateMA(symbol, timePeriods, currentTime)
      .then((result) => result);
  }

  @ApiImplicitQuery({ name: 'currentTime', required: false })
  @Get('RSI/:symbol')
  async getRSI(
    @Param('symbol') symbol: string,
    @Query('timePeriods') timePeriods: number,
    @Query('currentTime') currentTime?: number,
  ) {
    if (currentTime == null) {
      currentTime = Date.now();
    }

    return this.marketService
      .calculateRSI(symbol, timePeriods, currentTime)
      .then((result) => result);
  }

  @Get('newOrder/:symbol')
  async newOrder(
    @Param('symbol') symbol: string,
    @Query('quoteOrderQuantity') quoteOrderQuantity: number,
  ) {
    return this.binanceService
      .spotMarketOrder(symbol, Number(quoteOrderQuantity))
      .then((result) => result);
  }

  @Get('stopOrder/:symbol')
  async stopLimitOrder(
    @Param('symbol') symbol: string,
    @Query('quantity') quantity: number,
    @Query('stopPrice') stopPrice: number,
    @Query('price') price: number,
  ) {
    return this.binanceService
      .spotMarketStopLimitOrder(
        symbol,
        Number(quantity),
        Number(stopPrice),
        Number(price),
      )
      .then((result) => result);
  }
}