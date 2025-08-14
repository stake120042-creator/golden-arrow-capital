import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/config/database';
import walletService from '@/services/walletService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body || {};

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'userId is required' },
        { status: 400 }
      );
    }

    // Ensure user exists (best-effort check)
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Ensure XPUB configured
    const hasXpub = !!(process.env.XPUB_KEY || process.env.NEXT_PUBLIC_XPUB_KEY);
    if (!hasXpub) {
      return NextResponse.json(
        { success: false, message: 'Wallet is not configured on the server (XPUB_KEY missing).' },
        { status: 500 }
      );
    }

    // Try to fetch existing wallet
    const { data: existingWallet, error: fetchErr } = await supabase
      .from('user_wallets')
      .select('id, deposit_address, derivation_index, derivation_path, balance')
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle();

    if (fetchErr) {
      return NextResponse.json(
        { success: false, message: `Failed fetching wallet: ${fetchErr.message}` },
        { status: 500 }
      );
    }

    if (existingWallet && existingWallet.deposit_address) {
      return NextResponse.json({
        success: true,
        wallet: existingWallet,
      });
    }

    // Create one if not exists
    try {
      const created = await walletService.createDepositAddress(userId);
      return NextResponse.json({
        success: true,
        wallet: {
          deposit_address: created.address,
          derivation_index: created.derivationIndex,
          derivation_path: created.derivationPath,
          balance: 0,
        }
      });
    } catch (creationError: any) {
      return NextResponse.json(
        { success: false, message: creationError?.message || 'Failed to create wallet' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { success: false, message: 'Method GET not supported' },
    { status: 405 }
  );
}


