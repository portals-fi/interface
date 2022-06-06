import { Currency, CurrencyAmount, Token, TradeType } from '@uniswap/sdk-core'
import { InterfaceTrade, PortalsTrade } from 'state/routing/types'

import { PortalResponse } from './types'

export function transformResponseToTrade<TTradeType extends TradeType>(
  result: PortalResponse | undefined,
  inputCurrency: Currency,
  outputCurrency: Currency,
  tradeType: TTradeType,
  gasUseEstimateUSD?: CurrencyAmount<Token> | null
): InterfaceTrade<Currency, Currency, TTradeType> {
  if (!result) {
    throw new Error('Portal Response not valid')
  }
  return new PortalsTrade({
    // v2Routes:
    //   route
    //     ?.filter((r): r is typeof route[0] & { routev2: NonNullable<typeof route[0]['routev2']> } => r.routev2 !== null)
    //     .map(({ routev2, inputAmount, outputAmount }) => ({ routev2, inputAmount, outputAmount })) ?? [],
    // v3Routes:
    //   route
    //     ?.filter((r): r is typeof route[0] & { routev3: NonNullable<typeof route[0]['routev3']> } => r.routev3 !== null)
    //     .map(({ routev3, inputAmount, outputAmount }) => ({ routev3, inputAmount, outputAmount })) ?? [],
    inputAmount: CurrencyAmount.fromRawAmount(inputCurrency, result.context.sellAmount),
    outputAmount: CurrencyAmount.fromRawAmount(outputCurrency, result.context.minBuyAmount),
    tradeType,
    gasUseEstimateUSD,
    tx: result.tx,
  })
}
