import { http } from '@google-cloud/functions-framework'
import { readFileSync } from 'fs'
import sharp from 'sharp'

http('serve', async (req, res) => {
  let {
    url = '',
    quality = 70,
    format = 'avif'
  } = req.query

  /**
   * Don't allow quality to come through as 0
   */
  if (quality === 0) {
    quality = 70
  }

  const options = {
    quality
  }

  if (!url) {
    res.status(500).json({error: 'URL not set'})
  }

  const imageRes = await fetch(url)

  if (!imageRes.ok) {
    return res.status(500).json({error: 'Failed to download image'})
  }

  const buffer = await imageRes.arrayBuffer()
    .then(arrayBuffer => {
      return Buffer.from(arrayBuffer)
    })

  contentType = imageRes.headers.get('content-type')
  
  const image = sharp(buffer)
  const optimizedFilePath = `${process.env.CLOUDFUNCTION ? '/' : ''}tmp/image.${contentType.replace('image/', '')}`

  if (format === 'avif') {
    image.avif({
      quality: options.quality
    })

  } else if (format === 'webp') {
    image.webp({
      quality: options.quality
    })
  }

  await image.toFile(optimizedFilePath)

  console.log(`Optimised (quality: ${quality})`)

  res.setHeader('content-type', `image/${format}`)
  res.end(readFileSync(optimizedFilePath))
})
