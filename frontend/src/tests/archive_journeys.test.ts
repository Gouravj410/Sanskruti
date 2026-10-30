import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MOCK_ARCHIVE_DATA } from '../data/mockArchiveData.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('archive dataset has all 8 canonical art forms with authentic metadata', () => {
  const artForms = MOCK_ARCHIVE_DATA.art_forms;
  assert.equal(artForms.length, 8);

  const expectedSlugs = [
    'kolam',
    'warli',
    'madhubani',
    'mandana',
    'gond',
    'pattachitra',
    'kalamkari',
    'phad',
  ];

  for (const slug of expectedSlugs) {
    const found = artForms.find((af) => af.slug === slug);
    assert.ok(found, `Art form with slug "${slug}" must exist in archive.`);
    assert.ok(found.name.length > 0);
    assert.ok(found.region.length > 0);
    assert.ok(found.summary.length > 0);
    assert.ok(found.historical_context.length > 0);
    assert.ok(found.canonical_motifs.length >= 1, `Art form "${slug}" must have at least 1 canonical motif.`);
    assert.ok(found.sources.length >= 1, `Art form "${slug}" must have at least 1 primary archival source.`);

    // Verify local image file exists in public directory
    const publicPath = path.resolve(__dirname, '../../public', found.cover_image_url);
    assert.ok(
      fs.existsSync(publicPath),
      `Local cover image "${found.cover_image_url}" for ${slug} must exist at ${publicPath}`
    );
  }
});

test('archive dataset has 14 cataloged artifacts across Layer A and Layer B', () => {
  const artifacts = MOCK_ARCHIVE_DATA.artifacts;
  assert.equal(artifacts.length, 14);

  for (const art of artifacts) {
    assert.ok(art.id > 0);
    assert.ok(art.accession_number.length > 0);
    assert.ok(
      ['VERIFIED', 'COMMUNITY', 'AI_INTERPRETATION', 'AI_GENERATED'].includes(art.information_layer),
      `Artifact ${art.id} has invalid layer "${art.information_layer}"`
    );
    assert.ok(art.artist_attribution.length > 0);
    assert.ok(art.verification_source.length > 0);

    // Verify local image file exists in public directory
    const publicPath = path.resolve(__dirname, '../../public', art.image_url);
    assert.ok(
      fs.existsSync(publicPath),
      `Artifact image "${art.image_url}" for artifact ${art.id} must exist at ${publicPath}`
    );
  }
});

test('canonical motifs have complete iconographic descriptions and symbolism', () => {
  const artForms = MOCK_ARCHIVE_DATA.art_forms;
  let totalMotifs = 0;

  for (const af of artForms) {
    for (const motif of af.canonical_motifs) {
      totalMotifs++;
      assert.ok(motif.name.length > 0);
      assert.ok(motif.symbolism.length > 0);
      assert.ok(motif.visual_cue.length > 0);
    }
  }

  assert.ok(totalMotifs >= 16, `Archive must contain at least 16 canonical motifs; found ${totalMotifs}`);
});
