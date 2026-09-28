import { describe, it, expect } from 'vitest';
import {
  envSchema,
  env,
  getProviderConfigStatus,
  buildImdUrl,
  IMD_REFERENCE_VISUALIZATIONS,
  EnvConfig,
} from '../../src/config/env';

describe('External Data Provider Configuration Layer', () => {
  const minimalDevEnv: Record<string, string> = {
    PORT: '5001',
    NODE_ENV: 'development',
    JWT_SECRET: 'varshasetu_development_jwt_secret_key_32chars!',
    JWT_REFRESH_SECRET: 'varshasetu_development_refresh_secret_key_32chars!',
  };

  describe('1. Schema Validation & Safe Defaults', () => {
    it('successfully parses with only minimal required environment variables', () => {
      const parsed = envSchema.parse(minimalDevEnv);

      // Verify server defaults
      expect(parsed.PORT).toBe(5001);
      expect(parsed.NODE_ENV).toBe('development');

      // Verify external provider defaults
      expect(parsed.ECMWF_API_BASE_URL).toBe('https://api.ecmwf.int/v1');
      expect(parsed.ECMWF_API_KEY).toBeUndefined();

      expect(parsed.BHASHINI_API_BASE_URL).toBe('https://dhruva-api.bhashini.gov.in/services/inference/v4');
      expect(parsed.BHASHINI_API_KEY).toBeUndefined();
      expect(parsed.BHASHINI_INFERENCE_API_KEY).toBeUndefined();

      expect(parsed.IMD_API_BASE_URL).toBe('https://api.imd.gov.in/api/v1');
      expect(parsed.IMD_API_KEY).toBeUndefined();
      expect(parsed.IMD_ENABLED).toBe(true);
      expect(parsed.IMD_CURRENT_WEATHER_ENDPOINT).toBe('/current_wx');
      expect(parsed.IMD_DISTRICT_RAINFALL_ENDPOINT).toBe('/districtrainfall');
      expect(parsed.IMD_DISTRICT_WARNING_ENDPOINT).toBe('/districtwarning');
      expect(parsed.IMD_DISTRICT_NOWCAST_ENDPOINT).toBe('/districtnowcast');
      expect(parsed.IMD_DEFAULT_STATION_ID).toBe('42182');
      expect(parsed.IMD_DEFAULT_DISTRICT_ID).toBe('164');

      // Verify Simulation Mode default
      expect(parsed.SIMULATION_MODE).toBe(false);
    });

    it('gracefully handles missing optional provider keys without throwing or crashing', () => {
      expect(() => {
        envSchema.parse({
          ...minimalDevEnv,
          // Intentionally omitting ECMWF_API_KEY, BHASHINI_API_KEY, IMD_API_KEY
        });
      }).not.toThrow();
    });

    it('coerces string booleans correctly for simulation mode and flags', () => {
      const parsedWithSim = envSchema.parse({
        ...minimalDevEnv,
        SIMULATION_MODE: 'true',
        USE_MOCK_PROVIDERS: 'true',
        IMD_ENABLED: 'false',
      });

      expect(parsedWithSim.SIMULATION_MODE).toBe(true);
      expect(parsedWithSim.USE_MOCK_PROVIDERS).toBe(true);
      expect(parsedWithSim.IMD_ENABLED).toBe(false);
    });
  });

  describe('2. Provider Configuration Status Helper (getProviderConfigStatus)', () => {
    it('accurately identifies CONFIGURED when credentials are present', () => {
      const testConfig = envSchema.parse({
        ...minimalDevEnv,
        ECMWF_API_KEY: 'test-ecmwf-key-12345',
        BHASHINI_API_KEY: 'test-bhashini-udyat-key',
        BHASHINI_INFERENCE_API_KEY: 'test-inference-key',
        IMD_API_KEY: 'test-imd-key-abc',
        IMD_ENABLED: 'true',
      });

      const status = getProviderConfigStatus(testConfig);

      expect(status.ecmwf.status).toBe('CONFIGURED');
      expect(status.ecmwf.hasKey).toBe(true);
      expect(status.ecmwf.baseUrl).toBe('https://api.ecmwf.int/v1');

      expect(status.bhashini.status).toBe('CONFIGURED');
      expect(status.bhashini.hasApiKey).toBe(true);
      expect(status.bhashini.hasInferenceKey).toBe(true);

      expect(status.imd.status).toBe('CONFIGURED');
      expect(status.imd.hasKey).toBe(true);
      expect(status.imd.isEnabled).toBe(true);
    });

    it('accurately identifies NOT_CONFIGURED when optional keys are absent', () => {
      const unconfiguredEnv = envSchema.parse({
        ...minimalDevEnv,
        // No ECMWF, No Bhashini keys
      });

      const status = getProviderConfigStatus(unconfiguredEnv);

      expect(status.ecmwf.status).toBe('NOT_CONFIGURED');
      expect(status.ecmwf.hasKey).toBe(false);

      expect(status.bhashini.status).toBe('NOT_CONFIGURED');
      expect(status.bhashini.hasApiKey).toBe(false);
      expect(status.bhashini.hasInferenceKey).toBe(false);
    });

    it('STRICT PRIVACY: does NOT expose raw secret keys or tokens in status output', () => {
      const rawSecret = 'SUPER_SECRET_AUTHENTICATION_TOKEN_XYZ_987';
      const bhashiniRawSecret = 'BHASHINI_TOP_SECRET_CREDENTIAL_456';

      const secretConfig = envSchema.parse({
        ...minimalDevEnv,
        ECMWF_API_KEY: rawSecret,
        BHASHINI_API_KEY: bhashiniRawSecret,
        IMD_API_KEY: 'IMD_SECRET_KEY_123',
      });

      const status = getProviderConfigStatus(secretConfig);
      const serialized = JSON.stringify(status);

      // Verify no credentials leaked into the status object
      expect(serialized).not.toContain(rawSecret);
      expect(serialized).not.toContain(bhashiniRawSecret);
      expect(serialized).not.toContain('IMD_SECRET_KEY_123');

      // Verify keys are only exposed as booleans
      expect((status.ecmwf as any).ECMWF_API_KEY).toBeUndefined();
      expect((status.ecmwf as any).apiKey).toBeUndefined();
      expect(status.ecmwf.hasKey).toBe(true);
      expect(status.bhashini.hasApiKey).toBe(true);
    });
  });

  describe('3. IMD URL-Builder Helper (buildImdUrl)', () => {
    it('builds standard current weather URL with parameters', () => {
      const url = buildImdUrl('current_weather', {
        StationId: 42182,
        District: 'Lucknow',
        State: 'Uttar Pradesh',
      });

      expect(url).toContain('https://api.imd.gov.in/api/v1/current_wx');
      expect(url).toContain('StationId=42182');
      expect(url).toContain('District=Lucknow');
      expect(url).toContain('State=Uttar+Pradesh');
    });

    it('builds district rainfall URL with district and state', () => {
      const url = buildImdUrl('district_rainfall', {
        District: 'Lucknow',
        State: 'Uttar Pradesh',
      });

      expect(url).toContain('https://api.imd.gov.in/api/v1/districtrainfall');
      expect(url).toContain('District=Lucknow');
      expect(url).toContain('State=Uttar+Pradesh');
    });

    it('builds district warning and nowcast URLs', () => {
      const warningUrl = buildImdUrl('district_warning', { District: 'Lucknow' });
      const nowcastUrl = buildImdUrl('district_nowcast', { District: 'Lucknow' });

      expect(warningUrl).toBe('https://api.imd.gov.in/api/v1/districtwarning?District=Lucknow');
      expect(nowcastUrl).toBe('https://api.imd.gov.in/api/v1/districtnowcast?District=Lucknow');
    });

    it('handles trailing slash on base URL and leading slash on endpoint without doubling slashes', () => {
      const url = buildImdUrl('current_weather', undefined, 'https://api.imd.gov.in/api/v1/');
      expect(url).toBe('https://api.imd.gov.in/api/v1/current_wx');
    });

    it('filters out undefined and null parameters cleanly', () => {
      const url = buildImdUrl('current_weather', {
        StationId: 42182,
        District: undefined,
        State: null,
      });

      expect(url).toBe('https://api.imd.gov.in/api/v1/current_wx?StationId=42182');
      expect(url).not.toContain('District');
      expect(url).not.toContain('State');
    });

    it('supports custom path strings with query parameters', () => {
      const customUrl = buildImdUrl('/custom/satellite_cloud_index', { format: 'json' });
      expect(customUrl).toBe('https://api.imd.gov.in/api/v1/custom/satellite_cloud_index?format=json');
    });
  });

  describe('4. IMD GIS / Visualizations Reference Mapping', () => {
    it('provides immutable reference links for official IMD GIS products', () => {
      expect(IMD_REFERENCE_VISUALIZATIONS.RAINFALL_INFORMATION).toBe(
        'https://mausam.imd.gov.in/responsive/rainfallinformation.php'
      );
      expect(IMD_REFERENCE_VISUALIZATIONS.DISTRICT_WARNING_GIS).toBe(
        'https://mausam.imd.gov.in/responsive/districtWiseWarningGIS.php'
      );
      expect(IMD_REFERENCE_VISUALIZATIONS.DISTRICT_NOWCAST_GIS).toBe(
        'https://mausam.imd.gov.in/responsive/districtWiseNowcastGIS.php'
      );
    });
  });

  describe('5. Live Environment Verification', () => {
    it('verifies that the runtime env object successfully loads current environment', () => {
      expect(env).toBeDefined();
      expect(typeof env.PORT).toBe('number');
      expect(typeof env.IMD_API_BASE_URL).toBe('string');
      expect(typeof env.ECMWF_API_BASE_URL).toBe('string');
      expect(typeof env.BHASHINI_API_BASE_URL).toBe('string');
    });
  });
});
