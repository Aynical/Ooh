import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pstpayiznawwtlmgzase.supabase.co';
const supabaseAnonKey = 'sb_publishable_LUQTFlegzJxROavFaDR6TQ_wP9nzPqO';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);