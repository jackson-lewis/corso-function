import { http } from '@google-cloud/functions-framework'
import { Storage } from '@google-cloud/storage'
import { readFileSync } from 'fs'
import path from 'path'
import sharp from 'sharp'

const storage = new Storage()

http('optimize', async (req, res) => {
  let {
    url = '',
    buffer = '',
    contentType = '',
    quality = 70
  } = req.body

  /**
   * Don't allow quality to come through as 0
   */
  if (quality === 0) {
    quality = 70
  }

  const options = {
    quality
  }

  if (url) {
    const imageRes = await fetch(url)

    if (!imageRes.ok) {
      return res.status(500).json({error: 'Failed to download image'})
    }

    buffer = await imageRes.arrayBuffer()
      .then(arrayBuffer => {
        return Buffer.from(arrayBuffer)
      })

    contentType = imageRes.headers.get('content-type')
  }

  const filename = path.basename(url)

  const bucket = storage.bucket('original-image-backups')
  await bucket.file(filename).save(buffer, {
    contentType
  })
  
  const image = sharp(buffer)
  const optimizedFilePath = `${process.env.CLOUDFUNCTION ? '/' : ''}tmp/image.${contentType.replace('image/', '')}`

  if (contentType === 'image/jpeg') {
    image.jpeg({
      quality: options.quality
    })
  } else if (contentType === 'image/png') {
    image.png({
      quality: options.quality
    })
  }

  await image.toFile(optimizedFilePath)

  console.log(`Optimised (quality: ${quality})`)

  res.setHeader('content-type', contentType)
  res.end(readFileSync(optimizedFilePath))
})
