import QRCode from 'qrcode';

export interface QRCodeData {
  address: string;
  amount?: string;
  memo?: string;
}

export class QRCodeService {
  /**
   * Generate a unique BEP-20 address for a user
   * In a real implementation, this would be generated from the user's wallet or assigned from a pool
   */
  static generateUniqueAddress(userId: string): string {
    // This is a mock implementation - in production, this would be a real BEP-20 address
    const timestamp = Date.now().toString(16);
    const userIdHash = this.hashString(userId).substring(0, 8);
    const randomPart = Math.random().toString(16).substring(2, 10);
    
    // Format as a BEP-20 address (42 characters starting with 0x)
    return `0x${userIdHash}${timestamp}${randomPart}`.substring(0, 42);
  }

  /**
   * Generate QR code data URL for a BEP-20 address
   */
  static async generateQRCode(data: QRCodeData): Promise<string> {
    try {
      // Create the QR code data string
      let qrData = `ethereum:${data.address}`;
      
      if (data.amount) {
        qrData += `?amount=${data.amount}`;
      }
      
      if (data.memo) {
        const separator = data.amount ? '&' : '?';
        qrData += `${separator}memo=${encodeURIComponent(data.memo)}`;
      }

      // Generate QR code as data URL
      const qrCodeDataURL = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        errorCorrectionLevel: 'H'
      });

      return qrCodeDataURL;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  /**
   * Generate QR code for a specific amount
   */
  static async generateAmountQRCode(address: string, amount: string, memo?: string): Promise<string> {
    return this.generateQRCode({
      address,
      amount,
      memo
    });
  }

  /**
   * Simple hash function for generating consistent addresses
   */
  private static hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Validate BEP-20 address format
   */
  static isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  /**
   * Format address for display (show first 6 and last 4 characters)
   */
  static formatAddress(address: string): string {
    if (!this.isValidAddress(address)) {
      return address;
    }
    return `${address.substring(0, 8)}...${address.substring(address.length - 6)}`;
  }

  /**
   * Get network information for BEP-20
   */
  static getNetworkInfo() {
    return {
      name: 'BNB Smart Chain (BEP-20)',
      symbol: 'USDT',
      explorer: 'https://bscscan.com',
      rpcUrl: 'https://bsc-dataseed1.binance.org/',
      decimals: 18
    };
  }
}

export default QRCodeService;
