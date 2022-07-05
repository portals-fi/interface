export const CHAIN_LOOKUP: { [key: number]: string } = {
  1: 'ethereum',
  137: 'polygon',
  42161: 'arbitrum',
  10: 'optimism',
}

export interface PriceResponse {
  tokens: { price: number }[]
}

export interface AccountResponse {
  balances: {
    name: string
    symbol: string
    address: string
    decimals: number
    balance: number
    rawBalance: string
  }[]
}

export interface AccountQueryResponse {
  [key: string]: string
}

export interface ApprovalResponse {
  context: {
    network: string
    allowance: string
    approvalAmount: string
    shouldApprove: boolean
    target: string
    gasLimit: string
  }
  tx: {
    data: string
    to: string
    from: string
    gasLimit: { type: 'BigNumber'; hex: string }
  }
}

export interface PortalResponse {
  context: {
    network: string
    protcolId: string
    takerAddress: string
    sellToken: string
    sellAmount: string
    intermediateToken: string
    buyToken: string
    minBuyAmount: string
    buyAmount: string
    target: string
    partner: string
    value: string
    gasLimit?: string
  }
  tx: {
    data: string
    to: string
    from: string
    gasLimit?: { type: 'BigNumber'; hex: string }
    value: { type: 'BigNumber'; hex: string }
  }
}
