import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'Bastya',

  projectId: 'lvdrnar9',
  dataset: 'production',

  plugins: [structureTool()],

  schema: {
    types: schemaTypes,
  },

  releases: {
    enabled: false,
  },
  scheduledDrafts: {
    enabled: false,
  },

  document: {
    newDocumentOptions: () => [],
  },
})
