import { createClient, SupabaseClient } from '@supabase/supabase-js';

function normalizeSupabaseUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  let url = rawUrl.trim();
  url = url.replace(/\/rest\/v1\/?$/i, '');
  url = url.replace(/\/+$/, '');
  return url;
}

// Retrieve credentials from environment variables with fuzzy detection
let supabaseUrl = normalizeSupabaseUrl(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '');
let supabaseKey = (process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

if (!supabaseUrl || !supabaseKey) {
  for (const [k, v] of Object.entries(process.env)) {
    if (!v || typeof v !== 'string') continue;
    const keyLower = k.toLowerCase();
    if (keyLower.includes('supabase_url') || keyLower.includes('supabase-url')) {
      supabaseUrl = normalizeSupabaseUrl(v);
    }
    if (keyLower.includes('supabase_anon_key') || keyLower.includes('supabase_key')) {
      supabaseKey = v.trim();
    }
    if (k.includes('supabase.co')) {
      const match = k.match(/https?:\/\/[^\s"']+/);
      if (match) supabaseUrl = normalizeSupabaseUrl(match[0]);
      if (v.length > 20 && !supabaseKey) supabaseKey = v.trim();
    }
    if (v.includes('supabase.co')) {
      const match = v.match(/https?:\/\/[^\s"']+/);
      if (match) supabaseUrl = normalizeSupabaseUrl(match[0]);
    }
  }
}

let supabaseClient: SupabaseClient | null = null;
let isConnected = false;
let connectionError: string | null = null;

if (supabaseUrl && supabaseKey) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });
    console.log(`[SUPABASE] Client initialized with endpoint: ${supabaseUrl}`);
  } catch (err: any) {
    console.error('[SUPABASE] Initialization error:', err.message);
    connectionError = err.message;
  }
} else {
  console.log(`[SUPABASE] Status: URL='${supabaseUrl || 'None'}', Key='${supabaseKey ? 'Set' : 'Missing'}'. Running in resilient local mode with Supabase synchronization ready.`);
}

export const ALL_11_TABLES = [
  'locations',
  'roads',
  'traffic_readings',
  'traffic_predictions',
  'flood_observations',
  'flood_predictions',
  'infrastructure_sensors',
  'sensor_readings',
  'alerts',
  'simulation_scenarios',
  'emergency_routes'
] as const;

export const supabaseDb = {
  getClient: () => supabaseClient,
  isConfigured: () => Boolean(supabaseClient),
  getDetectedUrl: () => supabaseUrl || 'https://elsokyjtebkbncapuxkm.supabase.co',
  
  configureCredentials: (url: string, key: string) => {
    supabaseUrl = normalizeSupabaseUrl(url) || supabaseUrl || 'https://elsokyjtebkbncapuxkm.supabase.co';
    supabaseKey = key.trim();
    try {
      supabaseClient = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false },
      });
      console.log(`[SUPABASE] Reconfigured client with endpoint: ${supabaseUrl}`);
      return true;
    } catch (err: any) {
      console.error('[SUPABASE] Configuration error:', err.message);
      connectionError = err.message;
      return false;
    }
  },

  // Test connection to Supabase database
  async testConnection(): Promise<{ connected: boolean; url: string; error?: string; tables?: string[] }> {
    if (!supabaseClient) {
      return { 
        connected: false, 
        url: supabaseUrl || 'Not configured in environment (.env)', 
        error: 'Missing SUPABASE_URL or SUPABASE_ANON_KEY' 
      };
    }

    try {
      const { data, error } = await supabaseClient.from('locations').select('id, name').limit(3);
      if (error) {
        return {
          connected: false,
          url: supabaseUrl,
          error: error.message,
        };
      }
      isConnected = true;
      return {
        connected: true,
        url: supabaseUrl,
        tables: ALL_11_TABLES as unknown as string[],
      };
    } catch (e: any) {
      return {
        connected: false,
        url: supabaseUrl,
        error: e.message || 'Connection failed',
      };
    }
  },

  // Full verification test for all 11 tables and read/write execution
  async verifyAllTables(): Promise<{
    connected: boolean;
    url: string;
    verified_tables_count: number;
    total_tables_count: number;
    tables: Array<{
      name: string;
      exists: boolean;
      row_count: number;
      sample?: any;
      error?: string | null;
    }>;
    read_write_test: {
      success: boolean;
      table: string;
      write_record_id?: any;
      read_record_verified?: boolean;
      cleanup_status?: string;
      error?: string | null;
    };
    error?: string | null;
  }> {
    if (!supabaseClient) {
      return {
        connected: false,
        url: supabaseUrl || 'Missing SUPABASE_URL',
        verified_tables_count: 0,
        total_tables_count: ALL_11_TABLES.length,
        tables: ALL_11_TABLES.map(t => ({ name: t, exists: false, row_count: 0, error: 'Database client not initialized' })),
        read_write_test: {
          success: false,
          table: 'traffic_readings',
          error: 'Database client not initialized'
        },
        error: 'Supabase client is not configured. Missing SUPABASE_URL or SUPABASE_ANON_KEY.'
      };
    }

    const tableResults: Array<{
      name: string;
      exists: boolean;
      row_count: number;
      sample?: any;
      error?: string | null;
    }> = [];

    let verifiedCount = 0;

    for (const tableName of ALL_11_TABLES) {
      try {
        const { data, count, error } = await supabaseClient
          .from(tableName)
          .select('*', { count: 'exact', head: false })
          .limit(1);

        if (error) {
          tableResults.push({
            name: tableName,
            exists: false,
            row_count: 0,
            error: error.message
          });
        } else {
          verifiedCount++;
          tableResults.push({
            name: tableName,
            exists: true,
            row_count: count ?? data?.length ?? 0,
            sample: data?.[0] || null,
            error: null
          });
        }
      } catch (err: any) {
        tableResults.push({
          name: tableName,
          exists: false,
          row_count: 0,
          error: err.message
        });
      }
    }

    // Now test READ & WRITE capability
    const rwResult = {
      success: false,
      table: 'traffic_readings',
      write_record_id: undefined as any,
      read_record_verified: false,
      cleanup_status: 'NOT_ATTEMPTED',
      error: null as string | null
    };

    try {
      // 1. Write Test: insert a simulated probe reading
      const testEntry = {
        location_id: 'hebbal',
        vehicle_count: 420,
        average_speed_kmh: 48.5,
        congestion_level: 0.35,
        status: 'NORMAL',
        simulated: true
      };

      const { data: inserted, error: insertError } = await supabaseClient
        .from('traffic_readings')
        .insert([testEntry])
        .select('*')
        .single();

      if (insertError) {
        rwResult.error = `Write failed on traffic_readings: ${insertError.message}`;
      } else if (inserted && inserted.id) {
        rwResult.write_record_id = inserted.id;

        // 2. Read Test: verify the written record can be fetched back
        const { data: readBack, error: readError } = await supabaseClient
          .from('traffic_readings')
          .select('*')
          .eq('id', inserted.id)
          .single();

        if (readError) {
          rwResult.error = `Read-back failed: ${readError.message}`;
        } else if (readBack && readBack.id === inserted.id) {
          rwResult.read_record_verified = true;
          rwResult.success = true;

          // 3. Cleanup Test: remove probe entry
          const { error: deleteError } = await supabaseClient
            .from('traffic_readings')
            .delete()
            .eq('id', inserted.id);

          rwResult.cleanup_status = deleteError ? `Cleanup warning: ${deleteError.message}` : 'CLEANED_SUCCESSFULLY';
        }
      }
    } catch (e: any) {
      rwResult.error = `Exception during read/write test: ${e.message}`;
    }

    const connected = verifiedCount > 0;
    return {
      connected,
      url: supabaseUrl,
      verified_tables_count: verifiedCount,
      total_tables_count: ALL_11_TABLES.length,
      tables: tableResults,
      read_write_test: rwResult,
      error: connected ? null : 'None of the 11 tables responded successfully.'
    };
  },

  // Locations
  async getLocations(): Promise<any[] | null> {
    if (!supabaseClient) return null;
    try {
      const { data, error } = await supabaseClient.from('locations').select('*');
      if (error || !data || data.length === 0) return null;
      return data;
    } catch {
      return null;
    }
  },

  async seedLocations(locations: any[]): Promise<boolean> {
    if (!supabaseClient) return false;
    try {
      const { error } = await supabaseClient.from('locations').upsert(locations, { onConflict: 'id' });
      return !error;
    } catch {
      return false;
    }
  },

  async seedAllTables(locations: any[], roads: any[], sensors: any[], alerts: any[]): Promise<{
    locations: boolean;
    roads: boolean;
    sensors: boolean;
    alerts: boolean;
  }> {
    if (!supabaseClient) return { locations: false, roads: false, sensors: false, alerts: false };
    
    let locOk = false, roadOk = false, sensOk = false, altOk = false;
    try {
      const { error: locErr } = await supabaseClient.from('locations').upsert(locations, { onConflict: 'id' });
      locOk = !locErr;
    } catch {}

    try {
      const { error: roadErr } = await supabaseClient.from('roads').upsert(roads, { onConflict: 'id' });
      roadOk = !roadErr;
    } catch {}

    try {
      const { error: sensErr } = await supabaseClient.from('infrastructure_sensors').upsert(sensors, { onConflict: 'id' });
      sensOk = !sensErr;
    } catch {}

    try {
      const { error: altErr } = await supabaseClient.from('alerts').upsert(alerts, { onConflict: 'id' });
      altOk = !altErr;
    } catch {}

    return { locations: locOk, roads: roadOk, sensors: sensOk, alerts: altOk };
  },

  // Roads
  async getRoads(): Promise<any[] | null> {
    if (!supabaseClient) return null;
    try {
      const { data, error } = await supabaseClient.from('roads').select('*');
      if (error || !data || data.length === 0) return null;
      return data;
    } catch {
      return null;
    }
  },

  async updateRoadClosure(roadId: string, isClosed: boolean, reason?: string | null): Promise<boolean> {
    if (!supabaseClient) return false;
    try {
      const { error } = await supabaseClient
        .from('roads')
        .update({ is_closed: isClosed, closure_reason: reason })
        .eq('id', roadId);
      return !error;
    } catch {
      return false;
    }
  },

  // Alerts
  async getAlerts(): Promise<any[] | null> {
    if (!supabaseClient) return null;
    try {
      const { data, error } = await supabaseClient
        .from('alerts')
        .select('*')
        .order('timestamp', { ascending: false });
      if (error || !data || data.length === 0) return null;
      return data;
    } catch {
      return null;
    }
  },

  async acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<boolean> {
    if (!supabaseClient) return false;
    try {
      const { error } = await supabaseClient
        .from('alerts')
        .update({ is_acknowledged: true, acknowledged_by: acknowledgedBy })
        .eq('id', alertId);
      return !error;
    } catch {
      return false;
    }
  },

  // Sensors
  async getSensors(): Promise<any[] | null> {
    if (!supabaseClient) return null;
    try {
      const { data, error } = await supabaseClient.from('infrastructure_sensors').select('*');
      if (error || !data || data.length === 0) return null;
      return data;
    } catch {
      return null;
    }
  },

  async recordSensorReading(sensorId: string, value: number, status: string): Promise<boolean> {
    if (!supabaseClient) return false;
    try {
      const { error } = await supabaseClient
        .from('sensor_readings')
        .insert([{ sensor_id: sensorId, value, status, simulated: true }]);
      return !error;
    } catch {
      return false;
    }
  },

  // Simulations
  async recordSimulationScenario(scenario: any): Promise<boolean> {
    if (!supabaseClient) return false;
    try {
      const { error } = await supabaseClient
        .from('simulation_scenarios')
        .insert([{
          id: scenario.scenario_id,
          name: scenario.inputs.scenario_name,
          rainfall_intensity: scenario.inputs.rainfall_intensity_mm,
          drainage_capacity: scenario.inputs.drainage_capacity_pct,
          traffic_volume_multiplier: scenario.inputs.traffic_surge_factor,
          water_demand_multiplier: scenario.inputs.water_demand_factor,
          electricity_demand_multiplier: scenario.inputs.electricity_demand_factor,
          closed_roads: scenario.inputs.simulated_road_closures,
          results: scenario,
        }]);
      return !error;
    } catch {
      return false;
    }
  },

  // Emergency Routes
  async recordEmergencyRoute(route: any): Promise<boolean> {
    if (!supabaseClient) return false;
    try {
      const { error } = await supabaseClient
        .from('emergency_routes')
        .insert([{
          id: `route-${Date.now()}`,
          service_type: route.service_type,
          source_id: route.source_id,
          destination_id: route.destination_id,
          path_nodes: route.path_nodes,
          total_distance_km: route.total_distance_km,
          estimated_time_mins: route.estimated_time_mins,
          avoided_roads: route.avoided_hazards,
        }]);
      return !error;
    } catch {
      return false;
    }
  }
};
