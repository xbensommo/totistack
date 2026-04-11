// src/utils/seo.js
import { useHead } from '@unhead/vue'

const SITE_URL = 'https://www.totisoft.com'
const SITE_NAME = 'Totisoft'
const DEFAULT_OG_IMAGE = `${SITE_URL}/preview.PNG`

export function useSeo({
  title,
  description,
  path = '/',
  image = DEFAULT_OG_IMAGE,
  keywords = '',
  type = 'website',
  schema
}) {
  const url = `${SITE_URL}${path}`

  useHead({
    title,
    meta: [
      { name: 'description', content: description },
      ...(keywords ? [{ name: 'keywords', content: keywords }] : []),

      { property: 'og:type', content: type },
      { property: 'og:site_name', content: SITE_NAME },
      { property: 'og:title', content: title ? `${title} | ${SITE_NAME}` : SITE_NAME },
      { property: 'og:description', content: description },
      { property: 'og:url', content: url },
      { property: 'og:image', content: image },

      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title ? `${title} | ${SITE_NAME}` : SITE_NAME },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image }
    ],
    link: [
      { rel: 'canonical', href: url }
    ],
    script: schema
      ? [
          {
            type: 'application/ld+json',
            children: JSON.stringify(schema)
          }
        ]
      : []
  })
}