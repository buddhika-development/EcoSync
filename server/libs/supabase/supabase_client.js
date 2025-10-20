import { createClient } from "@supabase/supabase-js"
import { DATABASE_CONFIG } from "../../config"
import { _availability_check } from "../../utils/_availability_check"

const supabase_client = async () => {

    const SUPABASE_ULR = DATABASE_CONFIG.DB_URL
    const SUPABASE_ANON_KEY = DATABASE_CONFIG.DB_ANON_KEY

    if(!_availability_check(SUPABASE_ULR) || !_availability_check(SUPABASE_ANON_KEY)){
        throw new Error("Database credentials missing.")
    }

    const DATABASE_CONNECTION = await createClient(
        SUPABASE_ULR,
        SUPABASE_ANON_KEY
    )

    return DATABASE_CONNECTION
}

export default supabase_client