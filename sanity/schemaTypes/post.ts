import {defineType, defineField, defineArrayMember} from 'sanity'

export default defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
      description: 'Optional subtitle for the post',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      description: 'Brief summary of the post (used for meta description if SEO meta description is empty)',
      validation: Rule => Rule.max(200).warning('Keep under 200 characters for optimal SEO'),
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: {hotspot: true},
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{type: 'author'}],
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'category'}]})],
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      description: 'Publication date affects freshness ranking factor',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'lastModified',
      title: 'Last Modified',
      type: 'datetime',
      description: 'When content was last updated (important for freshness)',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'readingTime',
      title: 'Reading Time (Auto-calculated)',
      type: 'number',
      description: 'Estimated reading time in minutes (can be auto-calculated from content)',
      readOnly: false,
    }),
    defineField({
      name: 'wordCount',
      title: 'Word Count',
      type: 'number',
      description: 'Total word count (longer content often ranks better)',
      readOnly: false,
    }),
    defineField({
      name: 'contentScore',
      title: 'Content Quality Score',
      type: 'number',
      description: 'Internal quality score (1-100) based on SEO factors',
      validation: Rule => Rule.min(1).max(100),
      initialValue: 70,
    }),
    defineField({
      name: 'status',
      title: 'Publication Status',
      type: 'string',
      options: {
        list: [
          {title: 'Draft', value: 'draft'},
          {title: 'Published', value: 'published'},
          {title: 'Archived', value: 'archived'},
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
      description: 'Current publication status of the post',
    }),
    defineField({
      name: 'updatedAt',
      title: 'Updated At',
      type: 'datetime',
      description: 'Automatically updated when post is modified',
      readOnly: true,
    }),
    defineField({
      name: 'structuredData',
      title: 'Structured Data',
      type: 'object',
      description: 'Additional structured data for SEO',
      fields: [
        defineField({
          name: 'schemaType',
          title: 'Schema Type',
          type: 'string',
          options: {
            list: [
              {title: 'Article', value: 'Article'},
              {title: 'Blog Posting', value: 'BlogPosting'},
              {title: 'News Article', value: 'NewsArticle'},
              {title: 'Tech Article', value: 'TechArticle'},
              {title: 'How-To', value: 'HowTo'},
              {title: 'Review', value: 'Review'},
            ],
          },
          initialValue: 'Article',
        }),
        defineField({
          name: 'additionalProperties',
          title: 'Additional Properties',
          type: 'array',
          of: [
            defineArrayMember({
              type: 'object',
              fields: [
                defineField({name: 'key', title: 'Property Name', type: 'string'}),
                defineField({name: 'value', title: 'Property Value', type: 'string'}),
              ],
              preview: {
                select: {title: 'key', subtitle: 'value'},
              },
            }),
          ],
          description: 'Custom structured data properties',
        }),
      ],
      options: {
        collapsible: true,
        collapsed: true,
      },
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          marks: {
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    title: 'Url',
                    validation: Rule => Rule.uri({
                      scheme: ['http', 'https', 'mailto', 'tel']
                    })
                  },
                  {
                    name: 'target',
                    type: 'string',
                    title: 'Target',
                    options: {
                      list: [
                        {title: 'Same window', value: '_self'},
                        {title: 'New window', value: '_blank'},
                      ]
                    },
                    initialValue: '_self'
                  }
                ]
              }
            ]
          }
        }),
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative text',
              description: 'Important for SEO and accessibility.',
              validation: Rule => Rule.required()
            },
            {
              name: 'caption',
              type: 'string',
              title: 'Caption',
              description: 'Optional caption for the image'
            }
          ]
        }),
        defineArrayMember({
          type: 'customCode'
        }),
        defineArrayMember({
          type: 'object',
          name: 'faq',
          title: 'FAQ Section',
          fields: [
            defineField({
              name: 'question', 
              title: 'Question', 
              type: 'string',
              validation: Rule => Rule.required()
            }),
            defineField({
              name: 'answer', 
              title: 'Answer', 
              type: 'text',
              validation: Rule => Rule.required()
            }),
          ],
          preview: {
            select: {
              title: 'question',
              subtitle: 'answer'
            },
            prepare({title, subtitle}) {
              return {
                title: title || 'FAQ Item',
                subtitle: subtitle ? `${subtitle.substring(0, 60)}...` : 'No answer provided'
              }
            }
          },
        }),
        defineArrayMember({
          type: 'object',
          name: 'callout',
          title: 'Important Callout',
          fields: [
            defineField({
              name: 'type', 
              title: 'Type', 
              type: 'string', 
              options: {
                list: [
                  {title: '💡 Tip', value: 'tip'},
                  {title: '⚠️ Warning', value: 'warning'},
                  {title: 'ℹ️ Info', value: 'info'},
                  {title: '✅ Success', value: 'success'},
                  {title: '❌ Error', value: 'error'}
                ],
                layout: 'radio'
              },
              initialValue: 'info',
              validation: Rule => Rule.required()
            }),
            defineField({
              name: 'title', 
              title: 'Title', 
              type: 'string',
              validation: Rule => Rule.required()
            }),
            defineField({
              name: 'content', 
              title: 'Content', 
              type: 'text',
              validation: Rule => Rule.required()
            }),
          ],
          preview: {
            select: {
              title: 'title',
              type: 'type',
              content: 'content'
            },
            prepare({title, type, content}) {
              const typeEmojis: Record<string, string> = {
                tip: '💡',
                warning: '⚠️',
                info: 'ℹ️',
                success: '✅',
                error: '❌'
              };
              return {
                title: `${typeEmojis[type] || 'ℹ️'} ${title || 'Callout'}`,
                subtitle: content ? `${content.substring(0, 60)}...` : 'No content'
              }
            }
          },
        }),
      ],
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'seo',
      title: 'SEO & Meta Data',
      type: 'object',
      description: 'Comprehensive SEO fields for maximum Google ranking potential',
      fields: [
        // Core Meta Tags
        defineField({
          name: 'metaTitle',
          title: 'Meta Title',
          type: 'string',
          description: 'Optimized title for search engines (50-60 chars)',
          validation: Rule => Rule.max(60).warning('Keep under 60 characters for optimal display'),
        }),
        defineField({
          name: 'metaDescription',
          title: 'Meta Description',
          type: 'text',
          description: 'Compelling description for search results (150-160 chars)',
          validation: Rule => Rule.max(160).warning('Keep under 160 characters for optimal display'),
        }),
        defineField({
          name: 'focusKeyword',
          title: 'Focus Keyword',
          type: 'string',
          description: 'Primary keyword you want this post to rank for',
          validation: Rule => Rule.required(),
        }),
        defineField({
          name: 'secondaryKeywords',
          title: 'Secondary Keywords',
          type: 'array',
          of: [defineArrayMember({type: 'string'})],
          description: 'Additional keywords and variations to target',
        }),
        defineField({
          name: 'canonicalUrl',
          title: 'Canonical URL',
          type: 'url',
          description: 'Override canonical URL if needed (optional)',
        }),
        
        // Open Graph
        defineField({
          name: 'ogTitle',
          title: 'Open Graph Title',
          type: 'string',
          description: 'Title for social media sharing (leave empty to use meta title)',
        }),
        defineField({
          name: 'ogDescription',
          title: 'Open Graph Description',
          type: 'text',
          description: 'Description for social media sharing (leave empty to use meta description)',
        }),
        defineField({
          name: 'ogImage',
          title: 'Open Graph Image',
          type: 'image',
          options: {hotspot: true},
          description: 'Image for social media sharing (1200x630px recommended)',
        }),
        
        // Twitter Cards
        defineField({
          name: 'twitterCard',
          title: 'Twitter Card Type',
          type: 'string',
          options: {
            list: [
              {title: 'Summary', value: 'summary'},
              {title: 'Summary Large Image', value: 'summary_large_image'},
              {title: 'App', value: 'app'},
              {title: 'Player', value: 'player'},
            ],
            layout: 'radio',
          },
          initialValue: 'summary_large_image',
        }),
        defineField({
          name: 'twitterTitle',
          title: 'Twitter Title',
          type: 'string',
          description: 'Title for Twitter (leave empty to use OG title)',
        }),
        defineField({
          name: 'twitterDescription',
          title: 'Twitter Description',
          type: 'text',
          description: 'Description for Twitter (leave empty to use OG description)',
        }),
        defineField({
          name: 'twitterImage',
          title: 'Twitter Image',
          type: 'image',
          options: {hotspot: true},
          description: 'Image for Twitter (leave empty to use OG image)',
        }),
        
        // Advanced SEO
        defineField({
          name: 'noIndex',
          title: 'No Index',
          type: 'boolean',
          description: 'Prevent search engines from indexing this page',
          initialValue: false,
        }),
        defineField({
          name: 'noFollow',
          title: 'No Follow',
          type: 'boolean',
          description: 'Prevent search engines from following links on this page',
          initialValue: false,
        }),
        defineField({
          name: 'priority',
          title: 'Sitemap Priority',
          type: 'number',
          description: 'Priority in sitemap (0.0 to 1.0)',
          validation: Rule => Rule.min(0).max(1),
          initialValue: 0.8,
        }),
        defineField({
          name: 'changeFrequency',
          title: 'Change Frequency',
          type: 'string',
          description: 'How frequently the content is likely to change',
          options: {
            list: [
              {title: 'Always', value: 'always'},
              {title: 'Hourly', value: 'hourly'},
              {title: 'Daily', value: 'daily'},
              {title: 'Weekly', value: 'weekly'},
              {title: 'Monthly', value: 'monthly'},
              {title: 'Yearly', value: 'yearly'},
              {title: 'Never', value: 'never'},
            ],
          },
          initialValue: 'weekly',
        }),
        
        // Schema.org Structured Data
        defineField({
          name: 'articleType',
          title: 'Article Type',
          type: 'string',
          description: 'Type of article for structured data',
          options: {
            list: [
              {title: 'Article', value: 'Article'},
              {title: 'News Article', value: 'NewsArticle'},
              {title: 'Blog Posting', value: 'BlogPosting'},
              {title: 'Tech Article', value: 'TechArticle'},
              {title: 'How-To', value: 'HowTo'},
              {title: 'Review', value: 'Review'},
            ],
          },
          initialValue: 'BlogPosting',
        }),
        defineField({
          name: 'estimatedReadingTime',
          title: 'Estimated Reading Time (minutes)',
          type: 'number',
          description: 'Time it takes to read the article (auto-calculated recommended)',
        }),
        
        // Performance & UX
        defineField({
          name: 'featuredSnippet',
          title: 'Featured Snippet Optimization',
          type: 'object',
          description: 'Optimize for Google featured snippets',
          fields: [
            defineField({
              name: 'question',
              title: 'Target Question',
              type: 'string',
              description: 'Question this post answers for featured snippets',
            }),
            defineField({
              name: 'answer',
              title: 'Concise Answer',
              type: 'text',
              description: 'Direct answer (40-60 words) for featured snippets',
              validation: Rule => Rule.max(300),
            }),
          ],
        }),
        
        // Local SEO (if applicable)
        defineField({
          name: 'localSeo',
          title: 'Local SEO',
          type: 'object',
          description: 'For location-specific content',
          fields: [
            defineField({
              name: 'location',
              title: 'Target Location',
              type: 'string',
              description: 'City, region, or area this content targets',
            }),
            defineField({
              name: 'geoCoordinates',
              title: 'Geographic Coordinates',
              type: 'object',
              fields: [
                defineField({name: 'latitude', title: 'Latitude', type: 'number'}),
                defineField({name: 'longitude', title: 'Longitude', type: 'number'}),
              ],
            }),
          ],
        }),
        
        // Content Quality Indicators
        defineField({
          name: 'expertiseLevel',
          title: 'Expertise Level (E-E-A-T)',
          type: 'string',
          description: 'Experience, Expertise, Authoritativeness, Trustworthiness level',
          options: {
            list: [
              {title: 'Beginner', value: 'beginner'},
              {title: 'Intermediate', value: 'intermediate'},
              {title: 'Advanced', value: 'advanced'},
              {title: 'Expert', value: 'expert'},
            ],
          },
          initialValue: 'intermediate',
        }),
        defineField({
          name: 'contentFreshness',
          title: 'Content Freshness Score',
          type: 'number',
          description: 'How current/fresh is this content (1-10)',
          validation: Rule => Rule.min(1).max(10),
          initialValue: 8,
        }),
        
        // Analytics & Tracking
        defineField({
          name: 'trackingPixels',
          title: 'Custom Tracking Pixels',
          type: 'array',
          of: [defineArrayMember({type: 'string'})],
          description: 'Custom tracking codes for this specific post',
        }),
      ],
      options: {
        collapsible: true,
        collapsed: false,
      },
    }),
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      media: 'coverImage',
      published: 'publishedAt',
      seoScore: 'contentScore',
    },
    prepare({title, author, media, published, seoScore}) {
      const publishedDate = published ? new Date(published).toLocaleDateString() : 'Not published'
      return {
        title,
        subtitle: `By ${author || 'Unknown'} • ${publishedDate} • SEO Score: ${seoScore || 'N/A'}`,
        media,
      }
    },
  },
  orderings: [
    {
      title: 'Published Date, New',
      name: 'publishedAtDesc',
      by: [{field: 'publishedAt', direction: 'desc'}],
    },
    {
      title: 'Published Date, Old',
      name: 'publishedAtAsc',
      by: [{field: 'publishedAt', direction: 'asc'}],
    },
    {
      title: 'SEO Score, High to Low',
      name: 'seoScoreDesc',
      by: [{field: 'contentScore', direction: 'desc'}],
    },
  ],
})
