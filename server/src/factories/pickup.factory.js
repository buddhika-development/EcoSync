/**
 * Factory Method Pattern
 * Responsible for creating structured pickup orders and tasks consistently.
 */
export class PickupFactory {
    static createOrder(areaId, collectorId, scheduledDate) {
      return {
        area_id: areaId,
        collector_id: collectorId,
        scheduled_date: scheduledDate,
        status: "SCHEDULED",
        created_at: new Date().toISOString(),
      };
    }
  
    static createTasks(orderId, fullBinIds) {
      return fullBinIds.map((fullBinId) => ({
        order_id: orderId,
        full_bin_id: fullBinId,
      }));
    }
  }
  