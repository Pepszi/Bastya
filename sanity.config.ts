/**
 * Sanity Studio config for the embedded Astro route at /studio.
 */
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {schemaTypes} from './studio/schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'Bastya',

  projectId: 'lvdrnar9',
  dataset: 'production',

  plugins: [structureTool()],

  schema: {
    types: schemaTypes,
  },

  // Hide Content Releases (and the Releases navbar tab)
  releases: {
    enabled: false,
  },
  scheduledDrafts: {
    enabled: false,
  },

  // Hide the global "+" create-document button
  document: {
    newDocumentOptions: () => [],
  },
})
