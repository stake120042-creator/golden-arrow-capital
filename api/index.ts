// Vercel API endpoint that wraps your existing Express server
import { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../src/server/index';

export default app; 