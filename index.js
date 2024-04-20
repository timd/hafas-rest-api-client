'use strict'

/**
 * @typedef {import('ky').Options} KyOptions
 * @typedef {import('ky').HTTPError} HTTPError
 * @typedef {import('ky').ResponsePromise} ResponsePromise
 */

import stringifyQuery from 'qs/lib/stringify.js'
import ky from 'ky-universal'
import {parse as parseContentType} from 'content-type'
import createDebug from 'debug'

const debug = createDebug('hafas-rest-api-client')

const RESPONSE = Symbol('Response')
const HEADERS = Symbol('Response.headers')
const SERVER_TIMING = Symbol('Server-Timing header')
const CACHE = Symbol('X-Cache header')

/**
 * @param {string} endpoint - The API endpoint URL
 * @param {Object} [opt={}] - Additional options
 * @param {string} [opt.userAgent='hafas-rest-api-client'] - User agent string
 * @returns {Object} - The API client methods
 */
const createClient = (endpoint, opt = {}) => {
	new URL(endpoint); // throws if endpoint URL is invalid

	const {
		userAgent,
	} = {
		userAgent: 'hafas-rest-api-client',
	}

	/**
	 * @param {string} path - The API path
	 * @param {Object} [query={}] - Query parameters
	 * @param {KyOptions} [opt={}] - Additional options for ky
	 * @returns {Promise<Object>} - The API response data
	 */
	const request = async (path, query = {}, opt = {}) => {
		const url = new URL(path, endpoint)

		const cfg = {
			mode: 'cors',
			redirect: 'follow',
			searchParams: stringifyQuery(Object.fromEntries([
				...url.searchParams.entries(),
				...Object.entries(query),
			]), {allowDots: true}),
			...opt,
			headers: {
				'Accept': 'application/json',
				'User-Agent': userAgent,
				...(opt.headers || {}),
			},
		}

		let res
		try {
			res = await ky.get(url.href, cfg)
			debug(res.status, path, query, opt)
		} catch (err) {
			// parse JSON body, attach to error object
			try {
				const headers = err.response && err.response.headers
				const cType = headers && headers.get('content-type')
				if (cType && parseContentType(cType).type === 'application/json') {
					err.body = await err.response.json()
					if (err.body.msg) err.message += ' – ' + err.body.msg
				}
			// eslint-disable-next-line no-empty
			} catch (_) {}
			throw err
		}

		const body = await res.json()
		Object.defineProperty(body, RESPONSE, {value: res})
		Object.defineProperty(body, HEADERS, {value: res.headers})
		Object.defineProperty(body, SERVER_TIMING, {
			value: res.headers.get('Server-Timing') || null,
		})
		Object.defineProperty(body, CACHE, {
			value: res.headers.get('X-Cache') || null,
		})
		return body
	}

	/**
	 * @param {Object} query - Query parameters
	 * @param {KyOptions} [opt={}] - Additional options for ky
	 * @returns {Promise<Object>} - The locations response data
	 */
	const locations = async (query, opt = {}) => {
		return await request('/locations', {
			query,
			...opt,
		})
	}

	/**
	 * @param {Object} loc - Location coordinates
	 * @param {KyOptions} [opt={}] - Additional options for ky
	 * @returns {Promise<Object>} - The nearby stops response data
	 */
	const nearby = async (loc, opt = {}) => {
		return await request('/stops/nearby', {
			...loc,
			...opt,
		})
	}
	/**
	 * @param {string} query - Query string
	 * @param {KyOptions} [opt={}] - Additional options for ky
	 * @returns {Promise<Object>} - The stations response data
	 */
	const stations = async (query, opt = {}) => {
		return await request('/stations', {
			...opt,
			query,
		})
	}

	/**
	 * @param {Object} loc - Location coordinates  
	 * @param {KyOptions} [opt={}] - Additional options for ky
	 * @returns {Promise<Object>} - The reachable stops response data
	 */
	const reachableFrom = async (loc, opt = {}) => {
		return await request('/stops/reachable-from', {
			...loc,
			...opt,
		})
	}

	/**
 	* @param {string} id - Stop/station ID
 	* @param {KyOptions} [opt={}] - Additional options for ky
 	* @returns {Promise<Object>} - The stop/station response data
 	*/
	const stop = async (id, opt = {}) => {
		if (!id) throw new TypeError('invalid id')
		return await request('/stops/' + encodeURIComponent(id), opt)
	}

	/**
	 * @param {string} type - Either 'departures' or 'arrivals'
 	* @returns {Function} - The station board function
 	*/
	const _stationBoard = (type) => async (stop, opt = {}) => {
		if (!stop) throw new TypeError('invalid stop')
		if (stop.id) stop = stop.id
		else if ('string' !== typeof stop) throw new TypeError('invalid stop')
		return await request(`/stops/${encodeURIComponent(stop)}/departures`, opt)
	}
	const departures = _stationBoard('departures')
	const arrivals = _stationBoard('arrivals')

	/**
 	* @param {Object} from - Origin location
 	* @param {Object} to - Destination location
 	* @param {KyOptions} [opt={}] - Additional options for ky
 	* @returns {Promise<Object>} - The journeys response data  
 	*/
	const journeys = async (from, to, opt = {}) => {
		return await request('/journeys', {
			from, to,
			...opt,
		})
	}

	/**
 	* @param {string} ref - Ref URL for the journey
 	* @param {KyOptions} [opt={}] - Additional options for ky
 	* @returns {Promise<Object>} - The refreshed journey response data
 	*/
	const refreshJourney = async (ref, opt = {}) => {
		if (!ref) throw new TypeError('invalid ref')
		return await request('/journeys/' + encodeURIComponent(ref), opt)
	}

	/**
 	* @param {string} id - Trip ID  
 	* @param {string} lineName - Line name of the trip
 	* @param {KyOptions} [opt={}] - Additional options for ky
 	* @returns {Promise<Object>} - The trip response data
 	*/
	const trip = async (id, lineName, opt = {}) => {
		if (!id) throw new TypeError('invalid id')
		return await request('/trips/' + encodeURIComponent(id), {
			lineName,
			...opt,
		})
	}

	/**
 	* @param {Object} bbox - Bounding box coordinates
 	* @param {KyOptions} [opt={}] - Additional options for ky  
 	* @returns {Promise<Object>} - The radar response data
 	*/
	const radar = async (bbox, opt = {}) => {
		return await request('/radar', {
			...bbox,
			...opt,
		})
	}

	return {
		locations,
		nearby,
		stations,
		reachableFrom,
		stop,
		departures, arrivals,
		journeys,
		refreshJourney,
		trip,
		radar,
	}
}

/**
 * @type {typeof createClient}
 */
export default createClient

export {
	RESPONSE,
	HEADERS,
	SERVER_TIMING,
	CACHE,
}
