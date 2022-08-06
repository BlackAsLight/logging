import { readLines } from "https://deno.land/std@0.151.0/io/mod.ts"
import { compress } from "https://deno.land/x/zip@v1.2.3/mod.ts"

export default async function mergeLogs(quiet = false) {
	type Log = { time: number, line: string }
	const getDays = async () => {
		const days: Record<string, string[]> = {}
		for await (const entry of Deno.readDir('./logs/')) {
			if (!entry.isFile || !entry.name.endsWith('.log'))
				continue
			const day = entry.name.split('T')[ 0 ]
			if (!days[ day ])
				days[ day ] = []
			days[ day ].push(entry.name)
		}

		const today = ((date = new Date()) => `${date.getUTCFullYear()}-${(date.getUTCMonth() + 1).toString().padStart(2, '0')}-${date.getUTCDate().toString().padStart(2, '0')}`)()
		if (days[ today ])
			delete days[ today ]

		return Object.entries(days)
	}
	const readLog = async function* (file: Deno.FsFile) {
		const log: Log = { time: 0, line: '' }
		for await (const line of readLines(file)) {
			const date = new Date(line.slice(1, 25))
			if (line[ 0 ] === '[' && date.toJSON() && line[ 25 ] === ']') {
				if (log.time)
					yield log
				log.time = date.getTime()
				log.line = line + '\n'
			}
			else
				log.line += line + '\n'
		}
		file.close()
		return log
	}

	if (!quiet)
		console.time('mergeLogs')
	const days = await getDays()
	for (const [ day, fileNames ] of days) {
		if (!quiet) {
			console.log(`Merging: ${day} | ${fileNames.length.toLocaleString(undefined, { maximumFractionDigits: 0 })} Files.`)
			console.time(`${day} Logs Merged`)
		}

		const file = await Deno.create(`./logs/${day}.log`)
		const readLogs = await Promise.all(fileNames.map(fileName => Deno.open(`./logs/${fileName}`).then(file => readLog(file))))
		const nextLogs = await Promise.all(readLogs.map(readLog => readLog.next()))
		while (readLogs.length) {
			const time = nextLogs.reduce((time, nextLog) => nextLog.value.time < time ? nextLog.value.time : time, Infinity)
			const i = nextLogs.findIndex(nextLog => nextLog.value.time === time)
			await file.write(Uint8Array.from(nextLogs[ i ].value.line.split('').map(char => char.charCodeAt(0))))
			if (nextLogs[ i ].done) {
				Deno.remove(`./logs/${fileNames[ i ]}`)
				fileNames.splice(i, 1)
				readLogs.splice(i, 1)
				nextLogs.splice(i, 1)
			}
			else
				nextLogs[ i ] = await readLogs[ i ].next()
		}
		file.close()

		if (!quiet) {
			console.timeEnd(`${day} Logs Merged`)
			console.log(`Zipping: ${day}`)
			console.time(`${day} Logs Zipped`)
		}

		Deno.rename(`./logs/${day}.log`, `./${day}.log`)
		await compress(`./${day}.log`, `./logs/${day}.log.zip`)
		Deno.remove(`./${day}.log`)

		if (!quiet)
			console.timeEnd(`${day} Logs Zipped`)
	}
	if (!quiet)
		console.timeEnd('mergeLogs')
}
