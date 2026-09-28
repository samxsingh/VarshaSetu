import {
  LocationQuery,
  NormalizedCurrentWeather,
  NormalizedForecastResponse,
  ProviderHealth,
} from '../weather/types';

export interface WeatherProvider {
  readonly name: string;
  readonly providerId: string;
  readonly isEnabled: boolean;

  getCurrentConditions(location: LocationQuery): Promise<NormalizedCurrentWeather>;
  getForecast(location: LocationQuery, horizonDays?: number): Promise<NormalizedForecastResponse>;
  checkHealth(): Promise<ProviderHealth>;
}
