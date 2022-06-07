export const CHAIN_LOOKUP: { [key: number]: string } = {
  1: 'ethereum',
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
