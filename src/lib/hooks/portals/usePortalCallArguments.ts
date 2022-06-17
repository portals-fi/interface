import { BigNumber } from '@ethersproject/bignumber'
import { Currency, Percent, TradeType } from '@uniswap/sdk-core'
import { FeeOptions } from '@uniswap/v3-sdk'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { useArgentWalletContract } from 'hooks/useArgentWalletContract'
import useENS from 'hooks/useENS'
import { SignatureData } from 'hooks/useERC20Permit'
import { useMemo } from 'react'
import { PortalsTrade } from 'state/routing/types'

interface PortalCall {
  address: string
  calldata: string
  value: BigNumber
  gasLimit?: BigNumber
}

/**
 * Returns the swap calls that can be used to make the trade
 * @param trade trade to execute
 * @param allowedSlippage user allowed slippage
 * @param recipientAddressOrName the ENS name or address of the recipient of the swap output
 * @param signatureData the signature data of the permit of the input token amount, if available
 */
export function usePortalCallArguments(
  trade: PortalsTrade<Currency, Currency, TradeType> | undefined,
  allowedSlippage: Percent,
  recipientAddressOrName: string | null | undefined,
  signatureData: SignatureData | null | undefined,
  deadline: BigNumber | undefined,
  feeOptions: FeeOptions | undefined
): PortalCall[] {
  const { account, chainId, provider } = useActiveWeb3React()

  const { address: recipientAddress } = useENS(recipientAddressOrName)
  const recipient = recipientAddressOrName === null ? account : recipientAddress
  const argentWalletContract = useArgentWalletContract()

  return useMemo(() => {
    if (!trade || !recipient || !provider || !account || !chainId || !deadline || !trade?.tx) return []
    return [
      {
        address: trade.tx.to!,
        calldata: trade.tx.data!,
        value: trade.tx.value!,
        gasLimit: trade.tx.gasLimit ? BigNumber.from(trade.tx.gasLimit) : undefined,
      },
    ]
  }, [
    account,
    allowedSlippage,
    argentWalletContract,
    chainId,
    deadline,
    feeOptions,
    provider,
    recipient,
    signatureData,
    trade,
  ])
}
