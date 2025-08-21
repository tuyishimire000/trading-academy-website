/**
 * Card utility functions for payment processing
 */

export interface CardTypeInfo {
  type: string
  pattern: RegExp
  length: number[]
  cvvLength: number
  format: string
}

/**
 * Comprehensive card type detection patterns
 */
export const CARD_TYPES: CardTypeInfo[] = [
  {
    type: 'Visa',
    pattern: /^4/,
    length: [13, 16, 19],
    cvvLength: 3,
    format: '#### #### #### ####'
  },
  {
    type: 'Mastercard',
    pattern: /^5[1-5]|^2[2-7]/,
    length: [16],
    cvvLength: 3,
    format: '#### #### #### ####'
  },
  {
    type: 'American Express',
    pattern: /^3[47]/,
    length: [15],
    cvvLength: 4,
    format: '#### ###### #####'
  },
  {
    type: 'Discover',
    pattern: /^6(?:011|5)/,
    length: [16],
    cvvLength: 3,
    format: '#### #### #### ####'
  },
  {
    type: 'Diners Club',
    pattern: /^3(?:0[0-5]|[68])/,
    length: [14, 16, 19],
    cvvLength: 3,
    format: '#### ###### ####'
  },
  {
    type: 'JCB',
    pattern: /^(?:2131|1800|35)/,
    length: [16],
    cvvLength: 3,
    format: '#### #### #### ####'
  },
  {
    type: 'UnionPay',
    pattern: /^62/,
    length: [16, 17, 18, 19],
    cvvLength: 3,
    format: '#### #### #### ####'
  },
  {
    type: 'Maestro',
    pattern: /^(5018|5020|5038|6304|6759|6761|6763)/,
    length: [13, 14, 15, 16, 17, 18, 19],
    cvvLength: 3,
    format: '#### #### #### ####'
  }
]

/**
 * Detect card type from card number
 * @param cardNumber - The card number (with or without spaces)
 * @returns CardTypeInfo | null
 */
export function detectCardType(cardNumber: string): CardTypeInfo | null {
  const cleanNumber = cardNumber.replace(/\s/g, '')
  
  for (const cardType of CARD_TYPES) {
    if (cardType.pattern.test(cleanNumber)) {
      return cardType
    }
  }
  
  return null
}

/**
 * Format card number with spaces based on card type
 * @param cardNumber - The card number
 * @param cardType - The detected card type
 * @returns Formatted card number
 */
export function formatCardNumber(cardNumber: string, cardType?: CardTypeInfo): string {
  const cleanNumber = cardNumber.replace(/\s/g, '')
  
  if (!cardType) {
    // Default formatting for unknown card types
    return cleanNumber.replace(/(\d{4})(?=\d)/g, '$1 ')
  }
  
  // Apply specific formatting based on card type
  switch (cardType.type) {
    case 'American Express':
      return cleanNumber.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3')
    case 'Diners Club':
      return cleanNumber.replace(/(\d{4})(\d{6})(\d{4})/, '$1 $2 $3')
    default:
      return cleanNumber.replace(/(\d{4})(?=\d)/g, '$1 ')
  }
}

/**
 * Validate card number using Luhn algorithm
 * @param cardNumber - The card number to validate
 * @returns boolean
 */
export function validateCardNumber(cardNumber: string): boolean {
  const cleanNumber = cardNumber.replace(/\s/g, '')
  
  if (!/^\d{13,19}$/.test(cleanNumber)) {
    return false
  }
  
  // Luhn algorithm implementation
  let sum = 0
  let isEven = false
  
  // Loop through values starting from the rightmost side
  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber.charAt(i))
    
    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }
    
    sum += digit
    isEven = !isEven
  }
  
  return sum % 10 === 0
}

/**
 * Validate expiry date
 * @param expiryDate - The expiry date in MM/YY format
 * @returns boolean
 */
export function validateExpiryDate(expiryDate: string): boolean {
  const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/
  if (!expiryRegex.test(expiryDate)) {
    return false
  }
  
  const [month, year] = expiryDate.split('/')
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear() % 100
  const currentMonth = currentDate.getMonth() + 1
  
  const expiryYear = parseInt(year)
  const expiryMonth = parseInt(month)
  
  if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
    return false
  }
  
  return true
}

/**
 * Validate CVV based on card type
 * @param cvv - The CVV to validate
 * @param cardType - The card type
 * @returns boolean
 */
export function validateCVV(cvv: string, cardType?: CardTypeInfo): boolean {
  const expectedLength = cardType?.cvvLength || 3
  return new RegExp(`^\\d{${expectedLength}}$`).test(cvv)
}

/**
 * Get CVV length for a specific card type
 * @param cardType - The card type
 * @returns number
 */
export function getCVVLength(cardType?: string): number {
  if (!cardType) return 3
  
  const cardInfo = CARD_TYPES.find(type => type.type === cardType)
  return cardInfo?.cvvLength || 3
}

/**
 * Mask sensitive card data for logging
 * @param cardNumber - The card number to mask
 * @returns Masked card number
 */
export function maskCardNumber(cardNumber: string): string {
  const cleanNumber = cardNumber.replace(/\s/g, '')
  if (cleanNumber.length < 8) return '*'.repeat(cleanNumber.length)
  
  return cleanNumber.slice(0, 4) + '*'.repeat(cleanNumber.length - 8) + cleanNumber.slice(-4)
}

/**
 * Get card type icon color
 * @param cardType - The card type
 * @returns CSS color class
 */
export function getCardTypeColor(cardType: string): string {
  switch (cardType) {
    case 'Visa':
      return 'text-blue-600'
    case 'Mastercard':
      return 'text-red-600'
    case 'American Express':
      return 'text-green-600'
    case 'Discover':
      return 'text-orange-600'
    case 'Diners Club':
      return 'text-purple-600'
    case 'JCB':
      return 'text-red-500'
    case 'UnionPay':
      return 'text-blue-500'
    case 'Maestro':
      return 'text-gray-600'
    default:
      return 'text-gray-600'
  }
}
