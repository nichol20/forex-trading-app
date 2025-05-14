import { Rates } from "./exchange"

export interface RateItem {
    time: number
    rates: Rates
}

export interface ExchangeRatesEventResponse {
    rates: Rates,
    lastRates: RateItem[]
}