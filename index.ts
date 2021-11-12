
import dotenv from 'dotenv'
import { BikeTagClient } from 'biketag'
import { getGameDataPayload } from 'biketag/lib/common/payloads'

dotenv.config()

const opts = {
    game: process.env.BIKETAG_GAME,
    source: process.env.BIKETAG_SOURCE,
    imgur: {
      hash: process.env.IMGUR_HASH,
      clientId: process.env.IMGUR_CLIENT_ID,
      clientSecret: process.env.IMGUR_CLIENT_SECRET,
    },
    sanity: {
      projectId: process.env.SANITY_PROJECT_ID,
      dataset: process.env.SANITY_DATASET ?? 'development',
    },
    reddit: {
      subreddit: process.env.REDDIT_SUBREDDIT ? process.env.REDDIT_SUBREDDIT : 'cyclepdx',
      clientId: process.env.REDDIT_CLIENT_ID,
      clientSecret: process.env.REDDIT_CLIENT_SECRET,
      username: process.env.REDDIT_USERNAME,
      password: process.env.REDDIT_PASSWORD,
    },
  }
  const fromClass = new BikeTagClient(opts)
  
  const fetchBikeTags = async (client: BikeTagClient) => {
    /// Get game data from the API
    let {data: game} = await client.getGameData(opts as unknown as getGameDataPayload)
    
    console.info(game ? "\x1b[44mGame Retrieved\x1b[0m" : "\x1b[44mGame Could Not Be Retrieved\x1b[0m", { game })
    
    if (game || (opts.reddit?.subreddit || opts.imgur?.hash)) {
      /// Set and get the new configuration using the mainhash from the game
      const config = client.setConfiguration({imgur: { hash: game?.mainhash ?? opts.imgur?.hash}, reddit: { subreddit: game?.subreddit ?? opts.reddit?.subreddit } }, false)

      console.info("\x1b[44mNew Configuration Set For Additional Sources\x1b[0m", { config })
      
      /// get tag number 1 from different sources
      const {data: sanityTag1} = await client.getTag(1, {source: 'sanity'})
      const {data: redditTag1} = await client.getTag(1, {source: 'reddit'})

      console.info("\x1b[44mTags Fetched From Additional Sources\x1b[0m", { sanityTag1, redditTag1 })
    }

    /// get all tags from the default source
    const {data: tags, source: tagsSource} = await client.getTags()

    console.info("\x1b[44mAll Tags Fetched From Default Source\x1b[0m", { tags: tags.length > 50 ? [tags] : tags, tagsSource })
  }

  fetchBikeTags(fromClass)