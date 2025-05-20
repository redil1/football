import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'customCode',
  title: 'Code Block',
  type: 'object',
  fields: [
    defineField({
      name: 'filename',
      title: 'Filename',
      type: 'string',
      description: 'Optional: Name of the file (e.g., MyComponent.tsx)',
    }),
    defineField({
      name: 'language',
      title: 'Language',
      type: 'string',
      description: 'Syntax language (e.g., javascript, python, html, css, tsx, groq).',
      // You can provide a list of common languages for easier selection
      options: {
        list: [
          {title: 'Bash', value: 'bash'},
          {title: 'CSS', value: 'css'},
          {title: 'GROQ', value: 'groq'},
          {title: 'HTML', value: 'html'},
          {title: 'JavaScript', value: 'javascript'},
          {title: 'JSON', value: 'json'},
          {title: 'JSX', value: 'jsx'},
          {title: 'Markdown', value: 'markdown'},
          {title: 'Python', value: 'python'},
          {title: 'SQL', value: 'sql'},
          {title: 'TypeScript', value: 'typescript'},
          {title: 'TSX', value: 'tsx'},
          {title: 'YAML', value: 'yaml'},
          {title: 'Other', value: 'text'}, // Fallback
        ],
      },
    }),
    defineField({
      name: 'code',
      title: 'Code',
      type: 'text', // Using 'text' for multi-line code input
      validation: Rule => Rule.required(),
    }),
    // You could add 'highlightedLines' here too if desired, as an array of numbers
    // defineField({
    //   name: 'highlightedLines',
    //   title: 'Highlighted Lines',
    //   type: 'array',
    //   of: [{type: 'number'}],
    //   description: 'Optional: Array of line numbers to highlight.',
    // }),
  ],
  preview: {
    select: {
      title: 'filename',
      subtitle: 'language',
      code: 'code',
    },
    prepare({title, subtitle, code}) {
      return {
        title: title || 'Code Block',
        subtitle: subtitle || 'Language not set',
        media: undefined, // You could add an icon here
      };
    },
  },
});
