import { supabase } from "../../../libs/supabase/supabase.js";


/**
 * @param {string} collectorId - UUID of collector
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export async function getCollectorById(collectorId) {
    const { data, error } = await supabase
        .from('users')
        .select('user_id, user_email_address, user_first_name, user_last_name, user_role')
        .eq('user_id', collectorId)
        .eq('user_role', 'collector')
        .single();

    return { data, error };
}


/**
 * @param {string} collectorId - UUID of collector
 * @returns {Promise<{data: Array|null, error: Object|null}>}
 */
export async function getAllPickupOrders(collectorId) {
    const { data, error } = await supabase
        .from('v_collector_orders')
        .select('*')
        .eq('collector_id', collectorId)
        .order('scheduled_date', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });

    return { data, error };
}

/**
 * @param {string} collectorId 
 * @param {string} orderId 
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export async function checkCollectorAndOrder(collectorId, orderId) {
    const { data, error } = await supabase
        .from('v_collector_orders')
        .select('*')
        .eq('collector_id', collectorId)
        .eq('order_id', orderId)
        .single();

    return { data, error };
}

/**
 * @param {string} orderId 
 * @returns {Promise<{data: Array|null, error: Object|null}>}
 */
export async function getPickupOrderBins(orderId) {
    const { data, error } = await supabase
        .from('v_order_bins_detailed')
        .select('*')
        .eq('order_id', orderId)
        .order('cleared_at', { ascending: true, nullsFirst: true });

    return { data, error };
}

/**
 * @param {string} orderId - 
 * @param {string} status 
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export async function updatePickupOrderStatus(orderId, status) {
    const { data, error } = await supabase
        .from('pickup_orders')
        .update({ status })
        .eq('order_id', orderId)
        .select('*')
        .single();

    return { data, error };
}

/**
 * @param {string} orderId 
 * @returns {Promise<number>} 
 */
export async function countFullBinsByOrder(orderId) {
    const { count, error } = await supabase
        .from('pickup_tasks')
        .select('full_bin_id', { count: 'exact', head: true })
        .eq('order_id', orderId);

    if (error) throw error;
    return count || 0;
}

/**
 * @param {string} orderId
 * @returns {Promise<{data: Array|null, error: Object|null}>}
 */
export async function getPickupTasksByOrderId(orderId) {
    const { data, error } = await supabase
        .from('pickup_tasks')
        .select('task_id, order_id, full_bin_id, cleared_at, updated_at')
        .eq('order_id', orderId);

    return { data, error };
}

/**
 * @param {string} orderId 
 * @returns {Promise<{allCleared: boolean, totalTasks: number, clearedTasks: number, error: Object|null}>}
 */
export async function checkAllTasksCleared(orderId) {

    const { data, error } = await getPickupOrderBins(orderId);

    if (error) {
        return { allCleared: false, totalTasks: 0, clearedTasks: 0, error };
    }

    if (!data || data.length === 0) {
        return { allCleared: false, totalTasks: 0, clearedTasks: 0, error: null };
    }

    const totalTasks = data.length;
    const clearedTasks = data.filter(task =>
        task.request_status === 'COLLECTED' || task.request_status === 'CANCELLED'
    ).length;
    const allCleared = clearedTasks === totalTasks;

    console.log(`Order ${orderId} completion check:`, {
        totalTasks,
        clearedTasks,
        allCleared,
        statuses: data.map(t => ({
            bin_id: t.bin_id?.substring(0, 8),
            request_status: t.request_status
        }))
    });

    return { allCleared, totalTasks, clearedTasks, error: null };
}

/**
 * @param {string} orderId
 * @param {string} fullBinId
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export async function updatePickupTaskCleared(orderId, fullBinId) {
    const { data, error } = await supabase
        .from('pickup_tasks')
        .update({ cleared_at: new Date().toISOString() })
        .eq('order_id', orderId)
        .eq('full_bin_id', fullBinId)
        .select('*')
        .single();

    return { data, error };
}

/**
 * @param {string} orderId
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export async function getPickupOrderById(orderId) {
    const { data, error } = await supabase
        .from('pickup_orders')
        .select('*')
        .eq('order_id', orderId)
        .single();

    return { data, error };
}

//Bin status updating queries
/**
 * @param {string} fullBinId 
 * @param {string} status
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export async function updateFullBinStatus(binId, status) {
    const { data, error } = await supabase
        .from('full_bin_status')
        .update({ request_status: status })
        .eq('bin_id', binId)
        .select('*')
        .single();

    return { data, error };
}

/**
 * @param {string} binId
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export async function getFullBinStatusByBinId(binId) {
    const { data, error } = await supabase
        .from('full_bin_status')
        .select('*')
        .eq('bin_id', binId)
        .single();

    return { data, error };
}

/**
 * @param {string} binId 
 * @param {string} status 
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export async function updateBinStatus(binId, status) {
    const { data, error } = await supabase
        .from('bins')
        .update({ bin_status: status })
        .eq('bin_id', binId)
        .select('*')
        .single();

    return { data, error };
}

/**
 * @param {string} binId 
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export async function getBinStatusById(binId) {
    const { data, error } = await supabase
        .from('bins')
        .select('bin_id, bin_status')
        .eq('bin_id', binId)
        .single();

    return { data, error };
}

//recyclable queries

/**
 * @param {string} collectorId 
 * @returns {Promise<{data: Array|null, error: Object|null}>}
 */
export async function getAllRecyclableRequests(collectorId) {
    // First get the collector's area
    const { data: collector, error: collectorError } = await supabase
        .from('area')
        .select('area_id')
        .eq('collector_id', collectorId)
        .single();

    if (collectorError || !collector) {
        return { data: null, error: collectorError || new Error('Collector area not found') };
    }


    const { data, error } = await supabase
        .from('recyclable_collect_request')
        .select(`
            *,
            users!recyclable_collect_request_user_id_fkey (
                user_first_name,
                user_last_name,
                user_contact_number,
                user_email_address
            )
        `)
        .eq('area_id', collector.area_id)
        .order('created_at', { ascending: false });

    return { data, error };
}

/**
 * @param {string} requestId
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export async function getRecyclableRequestById(requestId) {
    const { data, error } = await supabase
        .from('recyclable_collect_request')
        .select(`
            *,
            users!recyclable_collect_request_user_id_fkey (
                user_first_name,
                user_last_name,
                user_contact_number,
                user_email_address
            ),
            area (
                area_name,
                collector_id
            )
        `)
        .eq('recyclable_collect_request_id', requestId)
        .single();

    return { data, error };
}

/**
 * @param {string} requestId 
 * @param {Object} updates 
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export async function updateRecyclableRequest(requestId, updates) {
    const { data, error } = await supabase
        .from('recyclable_collect_request')
        .update(updates)
        .eq('recyclable_collect_request_id', requestId)
        .select('*')
        .single();

    return { data, error };
}

//area queries

/**
 * @param {string} areaId 
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export async function getAreaById(areaId) {
    const { data, error } = await supabase
        .from('area')
        .select('*')
        .eq('area_id', areaId)
        .single();

    return { data, error };
}
