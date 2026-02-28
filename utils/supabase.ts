import { createClient } from "@supabase/supabase-js";
import "expo-sqlite/localStorage/install";

const supabaseUrl = "https://eszujhyytdrdsvwxdofl.supabase.co";
const supabasePublishableKey = "sb_publishable_pSL1CUpXeRVDbte_iY4dnw_VxM0SEB0";

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
