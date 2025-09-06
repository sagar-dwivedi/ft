import { writeFile } from 'node:fs/promises'

const URL = 'http://127.0.0.1:8000/openapi.json'
const TMP = 'openapi.tmp.json'

async function download(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`)
  return res.json()
}

function stripTagPrefix(openapi) {
  for (const pathItem of Object.values(openapi.paths)) {
    for (const op of Object.values(pathItem)) {
      if (!op || typeof op !== 'object') continue
      const [tag] = op.tags ?? []
      if (!tag) continue

      const prefix = `${tag}-`
      if (op.operationId?.startsWith(prefix)) {
        op.operationId = op.operationId.slice(prefix.length)
      }
    }
  }
  return openapi
}

;(async () => {
  try {
    const doc = stripTagPrefix(await download(URL))
    await writeFile(TMP, JSON.stringify(doc, null, 2))
    console.log(`✅  Fixed schema written to ${TMP}`)
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
})()