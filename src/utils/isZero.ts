import { BigNumber } from '@ethersproject/bignumber'

/**
 * Returns true if the string value is zero in hex
 * @param hexNumberString
 */
export default function isZero(hexNumberString: string) {
  return /^0x0*$/.test(hexNumberString)
}

/**
 * Returns true if the string value is zero in BigNumber
 * @param bigNumber
 */
export function isZeroBigNumber(bigNumber: BigNumber) {
  return bigNumber.isZero()
}
