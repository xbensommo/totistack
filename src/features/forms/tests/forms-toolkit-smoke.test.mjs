import test from 'node:test'
import assert from 'node:assert/strict'
import { slugify, createId } from '../../shared/featureToolkit.js'

test('shared toolkit creates ids and slugs', () => {
  assert.match(createId('form'), /^form_/) 
  assert.equal(slugify('My Great Form!'), 'my-great-form')
})
