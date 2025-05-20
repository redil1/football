import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'author',
  title: 'Author',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'name', maxLength: 96},
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Profile Image',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'array',
      of: [{type: 'block'}],
    }),
    defineField({
      name: 'social',
      title: 'Social Links',
      type: 'object',
      fields: [
        defineField({
          name: 'twitter',
          title: 'Twitter',
          type: 'url',
          validation: Rule => Rule.uri({allowRelative: false, scheme: ['https', 'http']})
        }),
        defineField({
          name: 'github',
          title: 'GitHub',
          type: 'url',
          validation: Rule => Rule.uri({allowRelative: false, scheme: ['https', 'http']})
        }),
        defineField({
          name: 'linkedin',
          title: 'LinkedIn',
          type: 'url',
          validation: Rule => Rule.uri({allowRelative: false, scheme: ['https', 'http']})
        })
      ]
    })
  ]
})
