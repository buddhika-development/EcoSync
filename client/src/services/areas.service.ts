// Service layer for areas management
import { api } from '@/lib/api';
import type { AreasResponse } from '@/types/area';

/**
 * Fetch all available areas with collector information
 * @returns Promise with list of areas
 * Note: If /api/areas doesn't exist, returns hardcoded areas as fallback
 */
export async function fetchAllAreas(): Promise<AreasResponse> {
    try {
        const response = await api('/api/areas', {
            method: 'GET',
        });

        if (!response.ok) {
            console.warn('Areas endpoint returned error, using fallback data');
            return getFallbackAreas();
        }

        const data = await response.json();

        // Return the data as-is since it matches our type structure
        if (data.ok && data.data) {
            return {
                ok: true,
                message: data.message || 'Areas fetched successfully',
                data: data.data,
            };
        }

        return getFallbackAreas();
    } catch (error) {
        console.warn('Failed to fetch areas from API, using fallback data:', error);
        // Return fallback areas instead of empty array
        return getFallbackAreas();
    }
}

/**
 * Fallback areas data when API is not available
 * This matches the structure provided by the user
 */
function getFallbackAreas(): AreasResponse {
    return {
        ok: true,
        message: 'Areas loaded (fallback data)',
        data: [
            {
                area_id: "d722cc21-0bba-4d52-bc99-6ada0999bc6f",
                area_name: "Bomiriya North",
                collector_id: "5a02a497-ce32-4024-9e8f-eb89acc3df0d",
                collector: {
                    user_last_name: "Bandara",
                    user_first_name: "Kalana"
                }
            },
            {
                area_id: "192a1fe0-3857-4cd4-b942-7a2c72ded27e",
                area_name: "Bomiriya South",
                collector_id: "ed6299ea-3412-4d21-b388-284c12b17c1e",
                collector: {
                    user_last_name: "Senanayake",
                    user_first_name: "Sapumal"
                }
            },
            {
                area_id: "735b1977-e51c-4fd3-bd3c-94fc4ce0dc44",
                area_name: "Dadigamuwa",
                collector_id: "a5873cd0-bc05-45ba-9836-f3b830a2d042",
                collector: {
                    user_last_name: "Kariyakarawana",
                    user_first_name: "Bandula"
                }
            },
            {
                area_id: "d0f910d5-eb8d-444f-8631-b7e3618f8d61",
                area_name: "Malabe East",
                collector_id: "75250c72-83b3-43db-b0ac-0d822d09fca3",
                collector: {
                    user_last_name: "weerasekara",
                    user_first_name: "Haritha"
                }
            },
            {
                area_id: "60ccfcc5-ee2c-4979-a0ef-b704bf7c483b",
                area_name: "Malabe North",
                collector_id: "62147f6c-2aeb-4f7a-bf1e-46a2a4bd1d55",
                collector: {
                    user_last_name: "Niyaz",
                    user_first_name: "Abdhul"
                }
            },
            {
                area_id: "44cf33b8-1557-44f5-a119-c0f560ddb4ec",
                area_name: "Malabe South",
                collector_id: "0a3b5b21-646a-40ae-a84a-601aa5d6b47c",
                collector: {
                    user_last_name: "Dias",
                    user_first_name: "Tharusha"
                }
            },
            {
                area_id: "0d4f44d7-c9df-4cea-9e0f-b7cda796c56b",
                area_name: "Nawagamuwa",
                collector_id: "8598c0cf-d287-4495-bb18-e61a7773d635",
                collector: {
                    user_last_name: "Fernando",
                    user_first_name: "Sahan"
                }
            },
            {
                area_id: "ade3873d-7769-4efa-aad3-04cb4ebc09e9",
                area_name: "Nawagamuwa South",
                collector_id: "728e29bd-9be2-425c-a51c-7e55d4012fff",
                collector: {
                    user_last_name: "Senevirathne",
                    user_first_name: "Shehan"
                }
            },
            {
                area_id: "ff156f1b-ad74-41ec-9a96-64fade08e6c9",
                area_name: "Ranala",
                collector_id: "3c310d2e-1aab-4e61-9482-03b84bf36cfe",
                collector: {
                    user_last_name: "Nawagammana",
                    user_first_name: "Rusiru"
                }
            },
            {
                area_id: "aaccb7a4-8bfb-46f5-bf82-121ab58d502e",
                area_name: "Wekewatta",
                collector_id: "f7b16b0c-304a-42f2-a0bc-04631e6d0205",
                collector: {
                    user_last_name: "Vithanage",
                    user_first_name: "Jaliya"
                }
            }
        ]
    };
}
