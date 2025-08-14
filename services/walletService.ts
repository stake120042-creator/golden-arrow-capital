import hdkey from 'hdkey';
import { supabase } from '../config/database';
import { computeAddress, Wallet, hexlify } from 'ethers';

type CreateAddressResult = {
  address: string;
  derivationIndex: number;
  derivationPath: string;
};

class WalletService {
  private static instance: WalletService;

  public static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService();
    }
    return WalletService.instance;
  }

  private getXpub(): string {
    const xpub = process.env.XPUB_KEY || process.env.NEXT_PUBLIC_XPUB_KEY || '';
    if (!xpub) {
      throw new Error('XPUB_KEY environment variable is not set');
    }
    return xpub;
  }

  private async getNextDerivationIndex(): Promise<number> {
    const { data, error } = await supabase
      .from('user_wallets')
      .select('derivation_index')
      .order('derivation_index', { ascending: false })
      .limit(1);

    if (error) {
      // If the table doesn't exist or any other error, surface it clearly
      throw new Error(`Failed querying next derivation index: ${error.message}`);
    }

    if (data && data.length > 0) {
      return (data[0] as any).derivation_index + 1;
    }
    return 0;
  }

  private deriveChildAddressFromXpub(xpub: string, index: number): { address: string; path: string } {
    // With an account-level xpub (e.g. m/44'/60'/0'), only non-hardened children are possible
    const root = hdkey.fromExtendedKey(xpub);

    // Derive using child indices to avoid path parser issues
    const change = root.deriveChild(0);
    const child = change.deriveChild(index);

    if (!child || (!(child as any).publicKey && !(child as any).privateKey)) {
      throw new Error('Invalid XPUB depth or format: could not derive child key from provided XPUB.');
    }

    // Prefer computing from public key; fallback to private key if available
    let address: string;
    try {
      if ((child as any)?.publicKey) {
        const pubBytes = (child as any).publicKey as Uint8Array | Buffer;
        const pubHex = hexlify(pubBytes);
        address = computeAddress(pubHex);
      } else if ((child as any)?.privateKey) {
        const pk = hexlify((child as any).privateKey);
        address = new Wallet(pk).address;
      } else {
        throw new Error('Derived key does not contain public or private key');
      }
    } catch (e: any) {
      throw new Error(`Failed to compute address from derived key: ${e?.message || String(e)}`);
    }
    const derivedPath = `m/0/${index}`;
    return { address, path: derivedPath };
  }

  public async createDepositAddress(userId: string): Promise<CreateAddressResult> {
    const xpub = this.getXpub();
    const nextIndex = await this.getNextDerivationIndex();

    const { address, path } = this.deriveChildAddressFromXpub(xpub, nextIndex);

    const { error } = await supabase
      .from('user_wallets')
      .insert({
        user_id: userId,
        deposit_address: address,
        derivation_index: nextIndex,
        derivation_path: path,
        balance: 0,
      });

    if (error) {
      throw new Error(`Failed to store deposit address: ${error.message}`);
    }

    return { address, derivationIndex: nextIndex, derivationPath: path };
  }
}

export default WalletService.getInstance();


