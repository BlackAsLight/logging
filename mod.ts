// deno-lint-ignore-file no-explicit-any
{
	try { Deno.statSync('./logs/') } catch { Deno.mkdirSync('./logs/') }
	const file = Deno.createSync(`./logs/${new Date().toJSON()}.log`)

	const write = (type: string, data: any[]) => {
		const records: string[] = [ `[${new Date().toJSON()}] [${type}]` ]
		for (let i = 0; i < data.length; ++i)
			records.push(Deno.inspect(data[ i ]))
		file.write(new TextEncoder().encode(records.join(' ') + '\n'))
		return records.join(' ')
	}

	const error = globalThis.console.error
	globalThis.console.error = (...data: any[]) => error(write('error', data))

	const warn = globalThis.console.warn
	globalThis.console.warn = (...data: any[]) => warn(write('warn', data))

	const log = globalThis.console.log
	globalThis.console.log = (...data: any[]) => log(write('log', data))

	const info = globalThis.console.info
	globalThis.console.info = (...data: any[]) => info(write('info', data))

	const debug = globalThis.console.debug
	globalThis.console.debug = (...data: any[]) => debug(write('debug', data))

	const timers: Record<string, number> = {}
	globalThis.console.time = (label = 'default') => {
		if (timers[ label ])
			return console.warn(`Timer ${label} already exists.`, timers)
		timers[ label ] = performance.now()
	}
	globalThis.console.timeLog = (label = 'default') => {
		const logTime = performance.now()
		const startTime = timers[ label ]
		if (!startTime)
			return console.warn(`Timer ${label} doesn't exist.`, timers)
		log(write('timer', [ `${label}: ${(logTime - startTime).toLocaleString(undefined, { maximumFractionDigits: 0 })}ms` ]))
	}
	globalThis.console.timeEnd = (label = 'default') => {
		const endTime = performance.now()
		const startTime = timers[ label ]
		if (!startTime)
			return console.warn(`Timer ${label} doesn't exist.`, timers)
		log(write('timer', [ `${label}: ${(endTime - startTime).toLocaleString(undefined, { maximumFractionDigits: 0 })}ms - timer ended` ]))
		delete timers[ label ]
	}
}
