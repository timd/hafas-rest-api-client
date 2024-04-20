export default createClient;
export type KyOptions = any;
export type HTTPError = any;
export type ResponsePromise = any;
/**
 * @param {string} endpoint - The API endpoint URL
 * @param {Object} [opt={}] - Additional options
 * @param {string} [opt.userAgent='hafas-rest-api-client'] - User agent string
 * @returns {Object} - The API client methods
 */
declare function createClient(endpoint: string, opt?: {
    userAgent?: string;
}): any;
export const RESPONSE: any;
export const HEADERS: any;
export const SERVER_TIMING: any;
export const CACHE: any;
