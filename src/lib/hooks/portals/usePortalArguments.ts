import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { ADDRESS_ZERO } from '@uniswap/v3-sdk'
import { useMemo } from 'react'

/**
 * Returns query arguments for the Routing API query or undefined if the
 * query should be skipped. Input arguments do not need to be memoized, as they will
 * be destructured.
 */
export default function usePortalArguments({
  tokenIn,
  tokenOut,
  amount,
  validate,
  userAddress,
  isWindowVisible,
}: {
  tokenIn: Currency | undefined
  tokenOut: Currency | undefined
  amount: CurrencyAmount<Currency> | undefined
  validate: boolean
  isWindowVisible: boolean
  userAddress?: string | null
}) {
  return useMemo(
    () =>
      !tokenIn || !tokenOut || !amount || tokenIn.equals(tokenOut) || (validate && !userAddress) || !isWindowVisible
        ? undefined
        : {
            amount: amount.quotient.toString(),
            tokenInAddress: tokenIn.isNative ? ADDRESS_ZERO : tokenIn.wrapped.address,
            tokenInChainId: tokenIn.chainId,
            tokenInDecimals: tokenIn.decimals,
            tokenInSymbol: tokenIn.symbol,
            tokenOutAddress: tokenOut.isNative ? ADDRESS_ZERO : tokenOut.wrapped.address,
            tokenOutChainId: tokenOut.chainId,
            tokenOutDecimals: tokenOut.decimals,
            tokenOutSymbol: tokenOut.symbol,
            takerAddress: userAddress ?? ADDRESS_ZERO,
            slippagePercentage: '0.02',
            validate: validate ?? false,
            partner: ADDRESS_ZERO,
          },
    [amount, tokenIn, tokenOut, userAddress, validate, isWindowVisible]
  )
}
