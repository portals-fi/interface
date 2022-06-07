import { BigNumber } from '@ethersproject/bignumber'
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
    inputAmount: CurrencyAmount.fromRawAmount(inputCurrency, result.context.sellAmount),
    outputAmount: CurrencyAmount.fromRawAmount(outputCurrency, result.context.minBuyAmount),
    tradeType,
    gasUseEstimateUSD,
    tx: {
      ...result.tx,
      value: BigNumber.from(result.tx.value ?? 0),
      gasLimit: result.tx.gasLimit ? BigNumber.from(result.tx.gasLimit) : undefined,
    },
  })
}
