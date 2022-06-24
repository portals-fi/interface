import { BigNumber } from '@ethersproject/bignumber'
import { IRoute, Trade } from '@uniswap/router-sdk'
import { Currency, CurrencyAmount, Percent, Price, Token, TradeType } from '@uniswap/sdk-core'
import { Pair } from '@uniswap/v2-sdk'
import { Route as V2Route } from '@uniswap/v2-sdk'
import { Pool } from '@uniswap/v3-sdk'
import { Route as V3Route } from '@uniswap/v3-sdk'

export enum TradeState {
  LOADING,
  INVALID,
  NO_ROUTE_FOUND,
  VALID,
  SYNCING,
}

// from https://github.com/Uniswap/routing-api/blob/main/lib/handlers/schema.ts

export type TokenInRoute = Pick<Token, 'address' | 'chainId' | 'symbol' | 'decimals'>

export type V3PoolInRoute = {
  type: 'v3-pool'
  tokenIn: TokenInRoute
  tokenOut: TokenInRoute
  sqrtRatioX96: string
  liquidity: string
  tickCurrent: string
  fee: string
  amountIn?: string
  amountOut?: string

  // not used in the interface
  address?: string
}

export type V2Reserve = {
  token: TokenInRoute
  quotient: string
}

export type V2PoolInRoute = {
  type: 'v2-pool'
  tokenIn: TokenInRoute
  tokenOut: TokenInRoute
  reserve0: V2Reserve
  reserve1: V2Reserve
  amountIn?: string
  amountOut?: string

  // not used in the interface
  // avoid returning it from the client-side smart-order-router
  address?: string
}

export interface GetQuoteResult {
  quoteId?: string
  blockNumber: string
  amount: string
  amountDecimals: string
  gasPriceWei: string
  gasUseEstimate: string
  gasUseEstimateQuote: string
  gasUseEstimateQuoteDecimals: string
  gasUseEstimateUSD: string
  methodParameters?: { calldata: string; value: string }
  quote: string
  quoteDecimals: string
  quoteGasAdjusted: string
  quoteGasAdjustedDecimals: string
  route: Array<V3PoolInRoute[] | V2PoolInRoute[]>
  routeString: string
}

export interface InterfaceTrade<TInput extends Currency, TOutput extends Currency, TTradeType extends TradeType> {
  gasUseEstimateUSD: CurrencyAmount<Token> | null | undefined
  readonly routes: IRoute<TInput, TOutput, Pair | Pool>[]
  readonly tradeType: TTradeType
  /**
   * The swaps of the trade, i.e. which routes and how much is swapped in each that
   * make up the trade. May consist of swaps in v2 or v3.
   */
  readonly swaps: {
    route: IRoute<TInput, TOutput, Pair | Pool>
    inputAmount: CurrencyAmount<TInput>
    outputAmount: CurrencyAmount<TOutput>
  }[]

  get inputAmount(): CurrencyAmount<TInput>
  get outputAmount(): CurrencyAmount<TOutput>
  /**
   * The price expressed in terms of output amount/input amount.
   */
  get executionPrice(): Price<TInput, TOutput>

  /**
   * Returns the percent difference between the route's mid price and the price impact
   */
  get priceImpact(): Percent
  /**
   * Get the minimum amount that must be received from this trade for the given slippage tolerance
   * @param slippageTolerance The tolerance of unfavorable slippage from the execution price of this trade
   * @returns The amount out
   */
  minimumAmountOut(slippageTolerance?: Percent, amountOut?: CurrencyAmount<TOutput>): CurrencyAmount<TOutput>
  /**
   * Get the maximum amount in that can be spent via this trade for the given slippage tolerance
   * @param slippageTolerance The tolerance of unfavorable slippage from the execution price of this trade
   * @returns The amount in
   */
  maximumAmountIn(slippageTolerance?: Percent, amountIn?: CurrencyAmount<TInput>): CurrencyAmount<TInput>
  /**
   * Return the execution price after accounting for slippage tolerance
   * @param slippageTolerance the allowed tolerated slippage
   * @returns The execution price
   */
  worstExecutionPrice(slippageTolerance?: Percent): Price<TInput, TOutput>
  // static fromRoutes<TInput extends Currency, TOutput extends Currency, TTradeType extends TradeType>(v2Routes: {
  //     routev2: V2RouteSDK<TInput, TOutput>;
  //     amount: TTradeType extends TradeType.EXACT_INPUT ? CurrencyAmount<TInput> : CurrencyAmount<TOutput>;
  // }[], v3Routes: {
  //     routev3: V3RouteSDK<TInput, TOutput>;
  //     amount: TTradeType extends TradeType.EXACT_INPUT ? CurrencyAmount<TInput> : CurrencyAmount<TOutput>;
  // }[], tradeType: TTradeType): Promise<Trade<TInput, TOutput, TTradeType>>;
  // static fromRoute<TInput extends Currency, TOutput extends Currency, TTradeType extends TradeType>(route: V2RouteSDK<TInput, TOutput> | V3RouteSDK<TInput, TOutput>, amount: TTradeType extends TradeType.EXACT_INPUT ? CurrencyAmount<TInput> : CurrencyAmount<TOutput>, tradeType: TTradeType): Promise<Trade<TInput, TOutput, TTradeType>>;
}

export class PortalsTrade<TInput extends Currency, TOutput extends Currency, TTradeType extends TradeType>
  implements InterfaceTrade<TInput, TOutput, TTradeType>
{
  gasUseEstimateUSD: CurrencyAmount<Token> | null | undefined

  // constructor({
  //   gasUseEstimateUSD,
  //   ...routes
  // }: {
  //   gasUseEstimateUSD?: CurrencyAmount<Token> | undefined | null
  //   v2Routes: {
  //     routev2: V2Route<TInput, TOutput>
  //     inputAmount: CurrencyAmount<TInput>
  //     outputAmount: CurrencyAmount<TOutput>
  //   }[]
  //   v3Routes: {
  //     routev3: V3Route<TInput, TOutput>
  //     inputAmount: CurrencyAmount<TInput>
  //     outputAmount: CurrencyAmount<TOutput>
  //   }[]
  //   tradeType: TTradeType
  // }) {
  //   super(routes)
  //   this.gasUseEstimateUSD = gasUseEstimateUSD
  // }

  private _priceImpact: Percent

  readonly tradeType: TTradeType
  private _minOutputAmount: CurrencyAmount<TOutput>
  private _outputAmount: CurrencyAmount<TOutput>
  private _inputAmount: CurrencyAmount<TInput>
  readonly inputCurrency: TInput
  readonly outputCurrency: TOutput
  readonly tx
  constructor({
    tradeType,
    inputAmount,
    outputAmount,
    gasUseEstimateUSD,
    tx,
    minOutputAmount,
  }: {
    tradeType: TTradeType
    inputAmount: CurrencyAmount<TInput>
    outputAmount: CurrencyAmount<TOutput>
    minOutputAmount: CurrencyAmount<TOutput>
    gasUseEstimateUSD?: CurrencyAmount<Token> | undefined | null
    tx?: {
      data: string
      to: string
      from: string
      gasLimit?: BigNumber
      value: BigNumber
    }
  }) {
    // super()
    // super({ v2Routes: [], v3Routes: [new Route([new Pool()])], tradeType })
    this._inputAmount = inputAmount
    this._outputAmount = outputAmount
    this.tradeType = tradeType
    this.inputCurrency = inputAmount.currency
    this.outputCurrency = outputAmount.currency
    this._executionPrice = new Price({ baseAmount: inputAmount, quoteAmount: outputAmount })
    this.gasUseEstimateUSD = gasUseEstimateUSD
    this._priceImpact = new Percent('1')
    this.tx = tx
    this._minOutputAmount = minOutputAmount
  }

  public routes: IRoute<TInput, TOutput, Pair | Pool>[] = []
  public swaps: {
    route: IRoute<TInput, TOutput, Pair | Pool>
    inputAmount: CurrencyAmount<TInput>
    outputAmount: CurrencyAmount<TOutput>
  }[] = []
  get priceImpact(): Percent {
    return new Percent(0)
  }
  worstExecutionPrice(slippageTolerance: Percent): Price<TInput, TOutput> {
    throw new Error('Method not implemented.')
  }
  get inputAmount(): CurrencyAmount<TInput> {
    return this._inputAmount
  }
  get outputAmount(): CurrencyAmount<TOutput> {
    return this._outputAmount
  }
  private _executionPrice: Price<TInput, TOutput>
  /**
   * The price expressed in terms of output amount/input amount.
   */
  get executionPrice(): Price<TInput, TOutput> {
    return this._executionPrice
  }
  /**
   * Get the minimum amount that must be received from this trade for the given slippage tolerance
   * @param slippageTolerance The tolerance of unfavorable slippage from the execution price of this trade
   * @returns The amount out
   */
  minimumAmountOut(slippageTolerance: Percent, amountOut?: CurrencyAmount<TOutput>): CurrencyAmount<TOutput> {
    return this._minOutputAmount
  }
  /**
   * Get the maximum amount in that can be spent via this trade for the given slippage tolerance
   * @param slippageTolerance The tolerance of unfavorable slippage from the execution price of this trade
   * @returns The amount in
   */
  maximumAmountIn(slippageTolerance: Percent, amountIn?: CurrencyAmount<TInput>): CurrencyAmount<TInput> {
    return this.inputAmount
  }
}

export class InterfaceTradeClass<
  TInput extends Currency,
  TOutput extends Currency,
  TTradeType extends TradeType
> extends Trade<TInput, TOutput, TTradeType> {
  gasUseEstimateUSD: CurrencyAmount<Token> | null | undefined

  constructor({
    gasUseEstimateUSD,
    ...routes
  }: {
    gasUseEstimateUSD?: CurrencyAmount<Token> | undefined | null
    v2Routes: {
      routev2: V2Route<TInput, TOutput>
      inputAmount: CurrencyAmount<TInput>
      outputAmount: CurrencyAmount<TOutput>
    }[]
    v3Routes: {
      routev3: V3Route<TInput, TOutput>
      inputAmount: CurrencyAmount<TInput>
      outputAmount: CurrencyAmount<TOutput>
    }[]
    tradeType: TTradeType
  }) {
    super(routes)
    this.gasUseEstimateUSD = gasUseEstimateUSD
  }
}
