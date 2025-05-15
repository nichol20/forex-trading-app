import { LatestRateItem, Rates } from "./exchange"

export interface ExchangeRatesEventResponse {
    rates: Rates,
    latestRates: LatestRateItem[]
}