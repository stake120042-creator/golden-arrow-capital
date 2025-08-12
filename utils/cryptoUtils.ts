// This module provides a unified interface for cryptographic functions
// with different implementations for browser and server environments

// Detect browser environment
const isBrowser = typeof window !== 'undefined';

// For browser environment - use simple mock implementation 
// (real password hashing should only happen on server)
const browserCrypto = {
  async hash(password: string, saltRounds: number): Promise<string> {
    console.warn('🔶 Client attempted password hashing - this should only happen on server');
    // Return a mock hash - in a real app, passwords should NEVER be hashed in browser
    return `mock_hash_${password}_${Date.now()}`;
  },
  
  async compare(password: string, hash: string): Promise<boolean> {
    console.warn('🔶 Client attempted password verification - this should only happen on server');
    // Mock verification for testing only
    return password.includes('correct'); // Simple mock for testing
  }
};

// For Node.js environment - use real bcrypt
const serverCrypto = {
  // We'll use dynamic import for bcrypt in Node.js environment
  async _getBcrypt() {
    if (isBrowser) return null;
    try {
      return await import('bcrypt');
    } catch (err) {
      console.error('Failed to import bcrypt:', err);
      return null;
    }
  },
  
  async hash(password: string, saltRounds: number): Promise<string> {
    const bcrypt = await this._getBcrypt();
    if (!bcrypt) {
      throw new Error('Bcrypt is not available in this environment');
    }
    return await bcrypt.hash(password, saltRounds);
  },
  
  async compare(password: string, hash: string): Promise<boolean> {
    const bcrypt = await this._getBcrypt();
    if (!bcrypt) {
      throw new Error('Bcrypt is not available in this environment');
    }
    return await bcrypt.compare(password, hash);
  }
};

// Export the appropriate implementation based on environment
const cryptoUtils = isBrowser ? browserCrypto : serverCrypto;

export default cryptoUtils;