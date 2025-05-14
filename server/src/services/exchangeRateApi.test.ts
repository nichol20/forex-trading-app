import { fetchExchangeRate, fetchTimeSeries } from './exchangeRateApi';
import { exchangeRateAPIClient } from '../utils/http';
import { getEnv } from '../config/env';
import { toUtcDateString } from '../utils/date';
import { Currency } from '../utils/currency';
import { ExchangeRateResponse, TimeSeriesReponse } from '../types/exchangeRateApi';

jest.mock('../utils/http');
jest.mock('../config/env');
jest.mock('../utils/date');

const mockedHttpClient = exchangeRateAPIClient as jest.Mocked<typeof exchangeRateAPIClient>;
const mockedGetEnv = getEnv as jest.Mock;
const mockedToUtcDateString = toUtcDateString as jest.Mock;

describe('fetchExchangeRate', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns rates when API responds with valid data', async () => {
        mockedGetEnv.mockReturnValue({ EXCHANGERATE_API_KEY: 'test-key' });

        const mockResponse: ExchangeRateResponse = {
            base: Currency.USD,
            ms: 1,
            updated: "",
            results: {
                USD: 1,
                GBP: 0.75,
            }
        };

        mockedHttpClient.get.mockResolvedValue({ data: mockResponse });

        const result = await fetchExchangeRate(Currency.USD, [Currency.GBP]);

        expect(mockedHttpClient.get).toHaveBeenCalledWith(expect.stringContaining('/fetch-multi?'));
        expect(result).toEqual({ rates: { USD: 1, GBP: 0.75 } });
    });

    it('throws an error when response does not include results', async () => {
        mockedGetEnv.mockReturnValue({ EXCHANGERATE_API_KEY: 'test-key' });

        const mockErrorResponse = { error: 'Invalid request' };
        mockedHttpClient.get.mockResolvedValue({ data: mockErrorResponse });

        await expect(fetchExchangeRate(Currency.USD, [Currency.GBP])).rejects.toThrow('Error requesting base code rate');
    });
});

describe('fetchTimeSeries', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns time series when API responds with valid data', async () => {
        mockedGetEnv.mockReturnValue({ EXCHANGERATE_API_KEY: 'test-key' });

        const mockStartDate = new Date('2023-01-01');
        const mockEndDate = new Date('2023-01-03');
        mockedToUtcDateString.mockImplementation((date: Date) => date.toISOString().split('T')[0]);

        const mockResponse: TimeSeriesReponse = {
            start: "",
            end: "",
            base: Currency.USD,
            interval: "",
            ms: 1,
            results: {
                GBP: {
                    '2023-01-01': 0.85,
                    '2023-01-02': 0.86,
                    '2023-01-03': 0.87,
                }
            }
        };

        mockedHttpClient.get.mockResolvedValue({ data: mockResponse });

        const result = await fetchTimeSeries(Currency.USD, Currency.GBP, mockStartDate, mockEndDate);

        expect(mockedHttpClient.get).toHaveBeenCalledWith(expect.stringContaining('/time-series?'));
        expect(result).toEqual(mockResponse.results);
    });

    it('throws an error when response does not include results', async () => {
        mockedGetEnv.mockReturnValue({ EXCHANGERATE_API_KEY: 'test-key' });

        const mockStartDate = new Date('2023-01-01');
        const mockEndDate = new Date('2023-01-03');

        const mockErrorResponse = { error: 'Invalid date range' };
        mockedHttpClient.get.mockResolvedValue({ data: mockErrorResponse });

        await expect(fetchTimeSeries(Currency.USD, Currency.GBP, mockStartDate, mockEndDate))
                .rejects
                .toThrow('Error requesting time series');
    });
});
