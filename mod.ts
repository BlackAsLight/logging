// deno-lint-ignore-file no-explicit-any
(function () {
	const formatDate = (date = new Date()) => `${date.getUTCFullYear()}-${date.getUTCMonth().toString().padStart(2, '0')}-${date.getUTCDate().toString().padStart(2, '0')}T${date.getUTCHours().toString().padStart(2, '0')}:${date.getUTCMinutes().toString().padStart(2, '0')}:${date.getUTCSeconds().toString().padStart(2, '0')}Z`

	try { Deno.statSync('./logs/') } catch { Deno.mkdirSync('./logs/') }
	const file = Deno.createSync(`./logs/${formatDate()}.log`)

	const write = (type: string, ...data: any[]) => {
		const record = `[${formatDate()}] [${type}] ${data.map(d => {
			const json = JSON.stringify(d, (_key, value) => typeof value === 'bigint' ? `${value}n` : value)
			return json[0] === '"' ? json.slice(1, -1) : json
		}).join(' ')}`.trim()
		file.write(Uint8Array.from(`${record}\n`.split('').map(char => char.charCodeAt(0))))
		return record
	}

	const error = globalThis.console.error
	globalThis.console.error = (...data: any[]) => error(write('error', ...data))

	const warn = globalThis.console.warn
	globalThis.console.warn = (...data: any[]) => warn(write('warn', ...data))

	const log = globalThis.console.log
	globalThis.console.log = (...data: any[]) => log(write('log', ...data))

	const info = globalThis.console.info
	globalThis.console.info = (...data: any[]) => info(write('info', ...data))

	const debug = globalThis.console.debug
	globalThis.console.debug = (...data: any[]) => debug(write('debug', ...data))

	const timers: Record<string, number> = {}
	globalThis.console.time = (label = 'default') => {
		if (timers[ label ])
			return warn(`Timer ${label} already exists.`, timers)
		timers[ label ] = performance.now()
	}
	globalThis.console.timeLog = (label = 'default') => {
		const logTime = performance.now()
		const startTime = timers[ label ]
		if (!startTime)
			return warn(`Timer ${label} doesn't exist.`, timers)
		log(write('timer', `${label}: ${(logTime - startTime).toLocaleString(undefined, { maximumFractionDigits: 0 })}ms`))
	}
	globalThis.console.timeEnd = (label = 'default') => {
		const endTime = performance.now()
		const startTime = timers[ label ]
		if (!startTime)
			return warn(`Timer ${label} doesn't exist.`, timers)
		log(write('timer', `${label}: ${(endTime - startTime).toLocaleString(undefined, { maximumFractionDigits: 0 })}ms - timer ended`))
		delete timers[ label ]
	}
})()
