import dotenv from 'dotenv'
import http from 'http'
import { join, extname } from 'path'
import { createReadStream, existsSync, readFileSync } from 'fs'

dotenv.config()
const port = process.env.PORT ?? 8080
const host = process.env.HOST ?? 'http://localhost'

const replaceEnvironmentVars = (text = "") => {
    return text
        .replace('BIKETAG_GAME', process.env.BIKETAG_GAME ?? "")
        .replace('IMGUR_CLIENT_ID', process.env.IMGUR_CLIENT_ID ?? "")
        .replace('IMGUR_CLIENT_SECRET', process.env.IMGUR_CLIENT_SECRET ?? "")
        .replace('IMGUR_HASH', process.env.IMGUR_HASH ?? "")
        .replace('IMGUR_ACCESS_TOKEN', process.env.IMGUR_ACCESS_TOKEN ?? "")
        .replace('REDDIT_CLIENT_ID', process.env.REDDIT_CLIENT_ID ?? "")
        .replace('REDDIT_CLIENT_SECRET', process.env.REDDIT_CLIENT_SECRET ?? "")
        .replace('REDDIT_USERNAME', process.env.REDDIT_USERNAME ?? "")
        .replace('REDDIT_PASSWORD', process.env.REDDIT_PASSWORD ?? "")
        .replace('REDDIT_SUBREDDIT', process.env.REDDIT_SUBREDDIT ?? "")
        .replace('SANITY_PROJECT_ID', process.env.SANITY_PROJECT_ID ?? "")
        .replace('SANITY_DATASET', process.env.SANITY_DATASET ?? "")
        .replace('SANITY_USERNAME', process.env.SANITY_USERNAME ?? "")
        .replace('SANITY_PASSWORD', process.env.SANITY_PASSWORD ?? "")
}

http.createServer(function (req, res){
    const path = req.url as string
    const filePath = join(__dirname, path)
    if (path === '/') {
        const htmlFile = readFileSync(join(__dirname, 'index.html'))
        res.write(replaceEnvironmentVars(htmlFile.toString()))
        return res.end()
    } else if (existsSync(filePath)) {
        const ext = extname(filePath)
        switch (ext) {
            case '.js': 
                res.setHeader("Content-Type", "text/javascript")
                return createReadStream(filePath).pipe(res)
            break
            default:
                const file = readFileSync(filePath)
                res.write(replaceEnvironmentVars(file.toString()))
                return res.end()
            break
        }
    }
    return res.writeHead(404).end()
}).listen(port)

console.log(`listening on ${host}:${port}`)