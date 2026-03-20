import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://iqiqfaushblbfiuqidye.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_TVGrA4-n2Q9MqeYNiuFfXw_bSO6Efc0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);