import { randomUUID } from 'node:crypto';
import { copyFile, mkdir, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const galleryFolder = 'Group Photos';
const galleryDirectory = fileURLToPath(new URL(`../${galleryFolder}/`, import.meta.url));
const outputFile = fileURLToPath(new URL('../assets/group-photos-data.js', import.meta.url));
const photoExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const captionDecoder = new TextDecoder('utf-8', { fatal: true });

async function readGalleryFiles() {
  try {
    const entries = await readdir(galleryDirectory, { withFileTypes: true });
    return entries.filter(entry => entry.isFile()).map(entry => entry.name).sort();
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

async function buildGallery() {
  const photos = new Map();
  const captions = new Map();
  for (const filename of await readGalleryFiles()) {
    const extension = extname(filename).toLowerCase();
    const files = extension === '.txt' ? captions : photoExtensions.has(extension) ? photos : null;
    if (!files) continue;

    const stem = filename.slice(0, -extension.length).normalize('NFC').toLowerCase();
    if (files.has(stem)) {
      throw new Error(`${galleryFolder}/: "${files.get(stem)}" e "${filename}" usam o mesmo nome-base. Renomeie um dos arquivos.`);
    }
    files.set(stem, filename);
  }

  const entries = [];
  for (const [stem, filename] of photos) {
    const captionFile = captions.get(stem);
    if (!captionFile) {
      console.warn(`${galleryFolder}/${filename}: aguardando o arquivo de legenda .txt.`);
      continue;
    }

    const bytes = await readFile(join(galleryDirectory, captionFile));
    let caption;
    try {
      caption = captionDecoder.decode(bytes).trim().replace(/\r\n/g, '\n');
    } catch {
      throw new Error(`${galleryFolder}/${captionFile}: salve a legenda como texto UTF-8.`);
    }
    if (!caption) {
      console.warn(`${galleryFolder}/${captionFile}: escreva a legenda para publicar a foto.`);
      continue;
    }

    entries.push({ filename, caption });
  }
  for (const [stem, captionFile] of captions) {
    if (!photos.has(stem)) console.warn(`${galleryFolder}/${captionFile}: aguardando a foto com o mesmo nome-base.`);
  }
  return entries;
}

async function main() {
  const args = process.argv.slice(2);
  const check = args[0] === '--check' && args.length === 1;
  const copyImagesTo = args[0] === '--copy-images-to' && args.length === 2 ? args[1] : null;
  if (args.length && !check && !copyImagesTo) {
    throw new Error('Uso: node scripts/build-group-photos.mjs [--check | --copy-images-to <pasta>]');
  }

  const entries = await buildGallery();
  const gallery = entries.map(({ filename, caption }) => ({
    src: `${encodeURIComponent(galleryFolder)}/${encodeURIComponent(filename)}`,
    caption,
  }));
  const data = JSON.stringify(gallery, null, 2);
  const contents = `// Gerado por scripts/build-group-photos.mjs. Edite as fotos e legendas em Group Photos/.\nwindow.LABEV_GROUP_PHOTOS = ${data};\n`;

  if (check) {
    const existing = await readFile(outputFile, 'utf8').catch(error => {
      if (error.code === 'ENOENT') return '';
      throw error;
    });
    if (existing.replace(/\r\n/g, '\n') !== contents) {
      throw new Error('assets/group-photos-data.js está desatualizado. Execute node scripts/build-group-photos.mjs.');
    }
    console.log(`${gallery.length} fotos conferidas em assets/group-photos-data.js.`);
    return;
  }

  if (copyImagesTo) {
    await mkdir(copyImagesTo, { recursive: true });
    for (const { filename } of entries) {
      await copyFile(join(galleryDirectory, filename), join(copyImagesTo, filename));
    }
  }

  const temporary = `${outputFile}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporary, contents, 'utf8');
    await rename(temporary, outputFile);
  } finally {
    await rm(temporary, { force: true });
  }
  console.log(`${gallery.length} fotos atualizadas em assets/group-photos-data.js.`);
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
