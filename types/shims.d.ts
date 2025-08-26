declare module 'hdkey';

// Fallbacks to satisfy type checking in non-Next lint contexts
declare module 'next/server' {
  export type NextRequest = any;
  export const NextResponse: any;
}

declare module 'crypto';
declare module 'bcryptjs';

declare const Buffer: any;
declare const process: any;


