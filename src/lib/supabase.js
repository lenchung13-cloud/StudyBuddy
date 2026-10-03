import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wwqfbbqxkvudhckulbyf.supabase.co'
const supabaseAnonKey = 'sb_publishable_pYLM6jjcr0o-xxDWLLCxNQ_QbkXzPmD'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
