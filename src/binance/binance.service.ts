import { HttpService, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as binance_config from '../constants/binance_config.json';
import * as binance_keys from '../keys/binance_keys.json';
import { MarketPriceTickerDto } from '../dtos/market-price-ticker.dto';
import { OrderBookDepthDto } from '../dtos/order-book-depth.dto';
import { client as WebSocketClient } from 'websocket';
import { KlineDto } from '../dtos/kline.dto';
import { SpotOrderDto } from '../dtos/spot-order.dto';
import { TradeStreamDto } from '../dtos/trade-stream.dto';
import { PositionInformationDto } from '../dtos/position-information.dto';
import { MarketInfoDto } from '../dtos/market-info.dto';

@Injectable()
export class BinanceService {
  constructor(private httpService: HttpService) {}

  private streamData = {};

  getStreamPrice(pair) {
    return this.streamData[pair].p;
  }

  // MARKET

  async getExchangeInfo() {
    return await this.httpService
      .get(binance_config.base_url + binance_config.exchange_info, {
        headers: { 'X-MBX-APIKEY': binance_keys.api_key },
      })
      .toPromise()
      .then((resp) => resp.data as MarketInfoDto)
      .catch((error) => error);
  }

  async getPriceTicker(symbol: string): Promise<any> {
    const params = { symbol };

    return await this.httpService
      .get(binance_config.base_url + binance_config.current_ticker_price, {
        params,
        headers: { 'X-MBX-APIKEY': binance_keys.api_key },
      })
      .toPromise()
      .then((resp) => resp.data as MarketPriceTickerDto)
      .catch((error) => error);
  }

  async getOrderBookDepth(symbol: string, limit: number): Promise<any> {
    const params = { symbol, limit };

    return await this.httpService
      .get(binance_config.base_url + binance_config.order_book_depth, {
        params,
        headers: { 'X-MBX-APIKEY': binance_keys.api_key },
      })
      .toPromise()
      .then((resp) => resp.data as OrderBookDepthDto)
      .catch((error) => error);
  }

  async getKLines(
    symbol: string,
    interval: string,
    startTime: number,
    endTime: number,
    limit: number,
  ) {
    const params = { symbol, interval, startTime, endTime, limit };

    return this.httpService
      .get(binance_config.base_url + binance_config.klines, {
        params,
        headers: { 'X-MBX-APIKEY': binance_keys.api_key },
      })
      .toPromise()
      .then((resp) => {
        return resp.data.map((kline) => new KlineDto(symbol, kline));
      })
      .catch((error) => error);
  }

  // TRADE

  async newBuyMarket(symbol: string, quantity: number) {
    const timestamp = Date.now().toString();
    const recvWindow = 5000;
    const side = 'BUY';
    const type = 'MARKET';

    const params = {
      symbol,
      side,
      type,
      quantity: quantity.toFixed(3),
      timestamp,
      recvWindow,
    };

    params['signature'] = this.generateAPISignature(params);

    return await this.httpService
      .post(binance_config.base_url + binance_config.order, null, {
        params,
        headers: { 'X-MBX-APIKEY': binance_keys.api_key },
      })
      .toPromise()
      .then((resp) => resp.data as SpotOrderDto)
      .catch((error) => {
        console.log(error);
        return error;
      });
  }

  async newSellMarket(symbol: string, quantity: number) {
    const timestamp = Date.now().toString();
    const recvWindow = 5000;
    const side = 'SELL';
    const type = 'MARKET';

    const params = {
      symbol,
      side,
      type,
      quantity,
      timestamp,
      recvWindow,
    };

    params['signature'] = this.generateAPISignature(params);

    return await this.httpService
      .post(binance_config.base_url + binance_config.order, null, {
        params,
        headers: { 'X-MBX-APIKEY': binance_keys.api_key },
      })
      .toPromise()
      .then((resp) => resp.data as SpotOrderDto)
      .catch((error) => {
        console.log(error);
        return error;
      });
  }

  async newTakeProfitMarket(
    symbol: string,
    quantity: number,
    stopPrice: number,
  ) {
    const timestamp = Date.now().toString();
    const recvWindow = 5000;
    const side = 'SELL';
    const type = 'TAKE_PROFIT_MARKET';

    const params = {
      symbol,
      side,
      type,
      quantity: quantity.toFixed(3),
      stopPrice: stopPrice.toFixed(3),
      timestamp,
      recvWindow,
    };

    params['signature'] = this.generateAPISignature(params);

    return await this.httpService
      .post(binance_config.base_url + binance_config.order, null, {
        params,
        headers: { 'X-MBX-APIKEY': binance_keys.api_key },
      })
      .toPromise()
      .then((resp) => resp.data as SpotOrderDto)
      .catch((error) => {
        console.log(error);
        return error;
      });
  }

  async newStopMarket(symbol: string, quantity: number, stopPrice: number) {
    const timestamp = Date.now().toString();
    const recvWindow = 5000;
    const side = 'SELL';
    const type = 'STOP_MARKET';

    const params = {
      symbol,
      side,
      type,
      quantity: quantity.toFixed(3),
      stopPrice: stopPrice.toFixed(3),
      timestamp,
      recvWindow,
    };

    params['signature'] = this.generateAPISignature(params);

    return await this.httpService
      .post(binance_config.base_url + binance_config.order, null, {
        params,
        headers: { 'X-MBX-APIKEY': binance_keys.api_key },
      })
      .toPromise()
      .then((resp) => resp.data as SpotOrderDto)
      .catch((error) => {
        console.log(error);
        return error;
      });
  }

  async cancelOrder(symbol: string, origClientOrderId: string): Promise<any> {
    const timestamp = Date.now().toString();
    const recvWindow = 5000;

    const params = {
      symbol,
      origClientOrderId,
      timestamp,
      recvWindow,
    };

    params['signature'] = this.generateAPISignature(params);

    return await this.httpService
      .delete(binance_config.base_url + binance_config.order, {
        params,
        headers: { 'X-MBX-APIKEY': binance_keys.api_key },
      })
      .toPromise()
      .then((resp) => resp.data as SpotOrderDto[])
      .catch((error) => error);
  }

  async getPositionInformation(symbol: string): Promise<any> {
    const timestamp = Date.now().toString();
    const recvWindow = 5000;

    const params = {
      symbol,
      timestamp,
      recvWindow,
    };

    params['signature'] = this.generateAPISignature(params);

    return await this.httpService
      .get(binance_config.base_url + binance_config.position_information, {
        params,
        headers: { 'X-MBX-APIKEY': binance_keys.api_key },
      })
      .toPromise()
      .then((resp) => resp.data as PositionInformationDto[])
      .catch((error) => error);
  }

  async setLeverage(symbol: string, leverage: number) {
    const timestamp = Date.now().toString();
    const recvWindow = 5000;

    const params = {
      symbol,
      leverage,
      timestamp,
      recvWindow,
    };

    params['signature'] = this.generateAPISignature(params);

    return await this.httpService
      .post(binance_config.base_url + binance_config.change_leverage, null, {
        params,
        headers: { 'X-MBX-APIKEY': binance_keys.api_key },
      })
      .toPromise()
      .then((resp) => resp.data)
      .catch((error) => {
        console.log(error);
        return error;
      });
  }

  async getAllOpenOrders(symbol: string): Promise<any> {
    const timestamp = Date.now().toString();
    const recvWindow = 5000;

    const params = {
      symbol,
      timestamp,
      recvWindow,
    };

    params['signature'] = this.generateAPISignature(params);

    return await this.httpService
      .get(binance_config.base_url + binance_config.open_orders, {
        params,
        headers: { 'X-MBX-APIKEY': binance_keys.api_key },
      })
      .toPromise()
      .then((resp) => resp.data as SpotOrderDto[])
      .catch((error) => error);
  }

  async getAllOrders(symbol: string): Promise<any> {
    const timestamp = Date.now().toString();
    const recvWindow = 5000;

    const params = {
      symbol,
      timestamp,
      recvWindow,
    };

    params['signature'] = this.generateAPISignature(params);

    return await this.httpService
      .get(binance_config.base_url + binance_config.all_orders, {
        params,
        headers: { 'X-MBX-APIKEY': binance_keys.api_key },
      })
      .toPromise()
      .then((resp) => resp.data as SpotOrderDto[])
      .catch((error) => error);
  }

  async getOrder(symbol: string, origClientOrderId: string): Promise<any> {
    const timestamp = Date.now().toString();
    const recvWindow = 5000;

    const params = {
      symbol,
      origClientOrderId,
      timestamp,
      recvWindow,
    };

    params['signature'] = this.generateAPISignature(params);

    return await this.httpService
      .get(binance_config.base_url + binance_config.order, {
        params,
        headers: { 'X-MBX-APIKEY': binance_keys.api_key },
      })
      .toPromise()
      .then((resp) => resp.data as SpotOrderDto[])
      .catch((error) => error);
  }

  // STREAM

  openTradeStream() {
    const client = new WebSocketClient();

    const streams = [
      binance_config.btcusdt_trade_stream,
      binance_config.ethusdt_trade_stream,
      binance_config.xrpusdt_trade_stream,
      binance_config.dotusdt_trade_stream,
      binance_config.adausdt_trade_stream,
      binance_config.bnbusdt_trade_stream,
    ];

    client.on('connect', (connection) => {
      console.log('Websocket Client Connected!');

      connection.on('close', () => {
        console.log('Websocket Client Connection Closed!');
        this.openTradeStream();
      });

      connection.on('message', (message) => {
        const streamJson = JSON.parse(message.utf8Data);
        const pair = streamJson.data.s;
        this.streamData[pair] = streamJson.data as TradeStreamDto;
      });
    });

    client.on('connectFailed', (err) => {
      console.log(err);
      this.openTradeStream();
    });

    client.connect(
      `${binance_config.base_url_stream}/stream?streams=${streams.join('/')}`,
    );
  }

  // API

  generateAPISignature(params: Record<string, unknown>) {
    let digestString = '';
    const keys = Object.keys(params);

    for (let i = 0; i < keys.length; i++) {
      digestString += keys[i] + '=' + params[keys[i]];
      if (i < keys.length - 1) {
        digestString += '&';
      }
    }

    return crypto
      .createHmac('sha256', binance_keys.api_secret)
      .update(digestString)
      .digest('hex');
  }

  // generateAPISignatureTest(params: Record<string, unknown>) {
  //   let digestString = '';
  //   const keys = Object.keys(params);
  //
  //   for (let i = 0; i < keys.length; i++) {
  //     digestString += keys[i] + '=' + params[keys[i]];
  //     if (i < keys.length - 1) {
  //       digestString += '&';
  //     }
  //   }
  //
  //   return crypto
  //     .createHmac('sha256', binance_keys.api_secret_test)
  //     .update(digestString)
  //     .digest('hex');
  // }
}
