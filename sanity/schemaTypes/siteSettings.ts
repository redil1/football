import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({name: 'title', title: 'Site Title', type: 'string', validation: Rule => Rule.required()}),
    defineField({name: 'description', title: 'Description', type: 'text'}),
    defineField({name: 'logo', title: 'Logo', type: 'image', options: {hotspot: true}}),
    defineField({name: 'favicon', title: 'Favicon', type: 'image'}),
    defineField({
      name: 'social',
      title: 'Social Links',
      type: 'object',
      fields: [
        {
          name: 'twitter',
          title: 'Twitter',
          type: 'url',
          validation: Rule => Rule.uri({allowRelative: false, scheme: ['https', 'http']})
        },
        {
          name: 'github',
          title: 'GitHub',
          type: 'url',
          validation: Rule => Rule.uri({allowRelative: false, scheme: ['https', 'http']})
        },
        {
          name: 'linkedin',
          title: 'LinkedIn',
          type: 'url',
          validation: Rule => Rule.uri({allowRelative: false, scheme: ['https', 'http']})
        }
      ]
    })
  ]
})
