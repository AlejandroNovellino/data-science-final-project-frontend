// pages/api/proxy/[...path].ts
import type { NextApiRequest, NextApiResponse } from 'next'
import http from 'http'

export const config = {
    api: {
        bodyParser: false,
    },
}

const BACKEND_BASE_URL = process.env.BACKEND_URL
console.log(BACKEND_BASE_URL)

if (!BACKEND_BASE_URL) {
    throw new Error('La variable BACKEND_URL no está definida')
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const path = req.query.path?.toString().replace(/,/g, '/')
    const targetUrl = `${BACKEND_BASE_URL}/${path}`

    console.log(`Target URL: ${targetUrl}`)

    const proxyReq = http.request(targetUrl, {
        method: req.method,
        headers: req.headers,
    }, (proxyRes) => {
        res.writeHead(proxyRes.statusCode || 500, proxyRes.headers)
        proxyRes.pipe(res, { end: true })
    })

    req.pipe(proxyReq, { end: true })

    proxyReq.on('error', (err) => {
        res.status(500).json({ error: err.message })
    })
}
