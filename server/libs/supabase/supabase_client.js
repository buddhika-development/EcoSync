import { createClient } from "@supabase/supabase-js"
import { DATABASE_CONFIG } from "../../config.js"
import { _availability_check } from "../../utils/_availability_check.js"

const supabase_client = () => {

    const SUPABASE_URL = DATABASE_CONFIG.DB_URL
    const SUPABASE_ANON_KEY = DATABASE_CONFIG.DB_ANON_KEY

    if(!_availability_check(SUPABASE_URL) || !_availability_check(SUPABASE_ANON_KEY)){
        throw new Error("Database credentials missing.")
    }

    const DATABASE_CONNECTION = createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    )

    return DATABASE_CONNECTION
}

// create supabase client (synchronously, not async)
const supabase = supabase_client()

export default supabase