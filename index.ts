
import dotenv from 'dotenv'
import { BikeTagClient } from 'biketag'
import { getGamePayload } from 'biketag/lib/common/payloads'
import { Game, Tag } from 'biketag/lib/common/schema'

dotenv.config()

const opts = {
    game: process.env.BIKETAG_GAME,
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
    let game = await client.game(opts as unknown as getGamePayload) as Game
    
    console.info(game ? "\x1b[44mGame Retrieved\x1b[0m" : "\x1b[44mGame Could Not Be Retrieved\x1b[0m", { game })
    
    if (game || (opts.reddit?.subreddit || opts.imgur?.hash)) {
      /// Set and get the new configuration using the mainhash from the game
      opts.imgur.hash = game.mainhash ?? opts.imgur.hash
      opts.reddit.subreddit = game?.subreddit ?? opts.reddit?.subreddit
      const config = client.config(opts)
      console.info("\x1b[44mNew Configuration Set For Additional Sources\x1b[0m", { config })
      
      /// get tag number 1 from different sources
      const sanityTag1 = await client.getTag(1, {source: 'sanity', concise: true })
      const redditTag1 = await client.getTag(1, {source: 'reddit', concise: true })

      console.info("\x1b[44mTags Fetched From Additional Sources\x1b[0m", { sanityTag1, redditTag1 })
    }

    /// get all tags from the default source
    const tags = await client.tags() as Tag[]
    console.log({tags})

    console.info("\x1b[44mAll Tags Fetched From Default Source\x1b[0m", { tags: tags.length > 50 ? [tags] : tags })
  }

  fetchBikeTags(fromClass)