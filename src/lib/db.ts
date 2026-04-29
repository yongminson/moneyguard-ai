import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 전 세계 어디서든 우리 DB에 접근할 수 있는 만능 통신 객체 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey);