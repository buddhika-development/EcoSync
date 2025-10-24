/**
 * Repository for collector-related data access
 * SOLID: Single Responsibility - handles database operations for collectors and pickup routes
 * Design Pattern: Repository Pattern - encapsulates data access logic
 */

import { supabase } from "../../../libs/supabase/supabase.js";

// ==================== COLLECTOR QUERIES ====================

/**
 * Get collector user by ID
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

// ==================== PICKUP ORDER QUERIES ====================

/**
 * Get all pickup orders for a specific collector
 * @param {string} collectorId - UUID of collector
 * @returns {Promise<{data: Array|null, error: Object|null}>}
 */
export async function getAllPickupOrders(collectorId) {
    const { data, error } = await supabase
        .from('v_collector_orders')
        .select('*')
        .eq('collector_id', collectorId)
        .order('scheduled_date', { ascending: true, nullsFirst: false }) // closest date first
        .order('created_at', { ascending: false }); // tie-breaker

    return { data, error };
}

/**
 * Get all pickup orders for a specific collector
 * @param {string} collectorId - UUID of collector
 * @param {string} orderId - UUID of pickup order
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
 * Get detailed bins for a specific pickup order
 * @param {string} orderId - UUID of pickup order
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
 * Update pickup order status
 * @param {string} orderId - UUID of pickup order
 * @param {string} status - New status value
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
 * Count full bins in a pickup order
 * @param {string} orderId - UUID of pickup order
 * @returns {Promise<number>} Count of bins
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
 * Get all pickup tasks for an order (to check cleared status)
 * @param {string} orderId - UUID of pickup order
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
 * Check if all tasks in an order have been cleared (collected or cancelled)
 * Uses v_order_bins_detailed view which includes request_status from full_bin_requests
 * @param {string} orderId - UUID of pickup order
 * @returns {Promise<{allCleared: boolean, totalTasks: number, clearedTasks: number, error: Object|null}>}
 */
export async function checkAllTasksCleared(orderId) {
    // Use the bins view which has request_status
    const { data, error } = await getPickupOrderBins(orderId);

    if (error) {
        return { allCleared: false, totalTasks: 0, clearedTasks: 0, error };
    }

    if (!data || data.length === 0) {
        return { allCleared: false, totalTasks: 0, clearedTasks: 0, error: null };
    }

    const totalTasks = data.length;
    // A task is cleared if request_status is COLLECTED or CANCELLED
    // - PENDING = Not yet collected (bin waiting)
    // - SCHEDULED = Assigned to route but not collected yet
    // - COLLECTED = Successfully collected by collector ✅
    // - CANCELLED = Request cancelled (considered "done") ✅
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
 * Update pickup task cleared_at timestamp
 * @param {string} orderId - UUID of pickup order
 * @param {string} fullBinId - UUID of full bin
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
 * Get pickup order by ID (to check current status)
 * @param {string} orderId - UUID of pickup order
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

// ==================== BIN STATUS QUERIES ====================

/**
 * Update full bin status
 * @param {string} fullBinId - UUID of full bin
 * @param {string} status - New status value
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
 * Get full bin status by bin_id
 * @param {string} binId - UUID of bin
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
 * Update bin status
 * @param {string} binId - UUID of bin
 * @param {string} status - New status value
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
 * Get bin by ID (to check current status)
 * @param {string} binId - UUID of bin
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

// ==================== RECYCLABLE QUERIES ====================

/**
 * Get all recyclable requests for a collector's area
 * @param {string} collectorId - UUID of collector
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

    // Then get all recyclable requests for that area
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
        .order('created_at', { ascending: false }); // most recent first

    return { data, error };
}

/**
 * Get specific recyclable request by ID
 * @param {string} requestId - UUID of recyclable request
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
 * Update recyclable request
 * @param {string} requestId - UUID of request
 * @param {Object} updates - Fields to update { status, category, weight }
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

// ==================== AREA QUERIES ====================

/**
 * Get area by ID
 * @param {string} areaId - UUID of area
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
