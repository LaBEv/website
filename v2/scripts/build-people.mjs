import { randomUUID } from 'node:crypto';
import { readFile, readdir, rename, rm, writeFile } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const peopleDirectory = fileURLToPath(new URL('../People/', import.meta.url));
const outputFile = join(peopleDirectory, 'people-data.js');
const groups = {
  current: 'Current Lab Members',
  alumni: 'Alumni-Visitors',
  collaborators: 'Collaborators',
};
const textFields = {
  name: 'Nome',
  role: 'Vínculo',
  education: 'Formação',
  research: 'Pesquisa',
  bio: 'Bio',
  email: 'E-mail',
};
const linkFields = {
  Lattes: 'CV Lattes',
  'Google Scholar': 'Google Scholar',
  ORCID: 'ORCID',
  ResearchGate: 'ResearchGate',
  Site: 'Website',
  Dissertação: 'Master’s dissertation',
  Tese: 'PhD thesis',
  Resumo: 'Conference abstract',
};
const allowedFields = new Set([...Object.values(textFields), ...Object.keys(linkFields), 'Foto']);

function readFields(contents) {
  const fields = new Map();
  let activeField;

  for (const [index, line] of contents.replace(/^\uFEFF/, '').split(/\r?\n/).entries()) {
    if (!line.trim() || /^\s*#/.test(line)) continue;
    if (/^\s/.test(line) && activeField) {
      fields.set(activeField, `${fields.get(activeField)} ${line.trim()}`.trim());
      continue;
    }

    const separator = line.indexOf(':');
    const label = separator < 0 ? '' : line.slice(0, separator).trim();
    if (!allowedFields.has(label)) {
      throw new Error(`linha ${index + 1}: campo inválido. Consulte modelo-perfil.txt.`);
    }
    if (fields.has(label)) throw new Error(`linha ${index + 1}: campo repetido (${label}).`);
    fields.set(label, line.slice(separator + 1).trim());
    activeField = label;
  }

  return fields;
}

function readLinks(fields) {
  const links = [];
  for (const [field, label] of Object.entries(linkFields)) {
    const value = fields.get(field);
    if (!value) continue;
    const url = URL.parse(value);
    if (!url || !/^https?:\/\//i.test(value) || url.username || url.password) {
      throw new Error(`${field} deve conter um link completo começando com https:// ou http://.`);
    }
    links.push({ label, url: url.href });
  }
  return links;
}

function readPhoto(value, photos) {
  if (!value) return '';
  if (/^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(value)) {
    const bytes = Buffer.from(value.slice('data:image/jpeg;base64,'.length), 'base64');
    if (bytes.length < 4 || bytes[0] !== 255 || bytes[1] !== 216 || bytes.at(-2) !== 255 || bytes.at(-1) !== 217) {
      throw new Error('a foto incorporada está incompleta. Salve o Perfil novamente no formulário.');
    }
    return value;
  }
  if (!/\.(?:jpe?g|png|webp)$/i.test(value) || !photos.has(value)) {
    throw new Error(`foto "${value}" não encontrada em People/Photos ou fora dos formatos aceitos.`);
  }
  return `People/Photos/${encodeURIComponent(value)}`;
}

async function getFiles(directory, optional = false) {
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    return entries.filter((entry) => entry.isFile()).map((entry) => entry.name).sort();
  } catch (error) {
    if (optional && error.code === 'ENOENT') return [];
    throw error;
  }
}

async function buildProfiles() {
  const photoFiles = new Set(await getFiles(join(peopleDirectory, 'Photos'), true));
  const seenNames = new Set();
  const seenIds = new Set();
  const profiles = {};

  for (const [group, folder] of Object.entries(groups)) {
    profiles[group] = [];
    const directory = join(peopleDirectory, folder);
    const files = await getFiles(directory, true);

    for (const filename of files.filter((file) => /\.txt$/i.test(file))) {
      try {
        const fields = readFields(await readFile(join(directory, filename), 'utf8'));
        const details = Object.fromEntries(Object.entries(textFields).map(([key, field]) => [key, fields.get(field) ?? '']));
        const id = filename.slice(0, -4).replace(/^\d+-/, '').toLowerCase();
        const comparableName = details.name.normalize('NFC').replace(/\s+/g, ' ').toLowerCase();

        if (!details.name) throw new Error('preencha o campo Nome.');
        if (!id || seenIds.has(id)) throw new Error('use um nome de arquivo único.');
        if (seenNames.has(comparableName)) throw new Error(`já existe um perfil chamado "${details.name}".`);
        if (details.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email)) {
          throw new Error('preencha E-mail com um endereço válido.');
        }

        const photo = readPhoto(fields.get('Foto'), photoFiles);
        const links = readLinks(fields);
        profiles[group].push({ id, ...details, photo, links });
        seenIds.add(id);
        seenNames.add(comparableName);
      } catch (error) {
        throw new Error(`${folder}/${filename}: ${error.message}`);
      }
    }
  }

  return profiles;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length > 1 || (args.length === 1 && args[0] !== '--check')) {
    throw new Error('Uso: node scripts/build-people.mjs [--check]');
  }

  const profiles = await buildProfiles();
  const total = Object.values(profiles).flat().length;
  const data = JSON.stringify(profiles, null, 2);
  const contents = `// Gerado por scripts/build-people.mjs. Edite os arquivos Perfil em People/.\nwindow.LABEV_PEOPLE = ${data};\n`;

  if (args[0] === '--check') {
    const existing = await readFile(outputFile, 'utf8').catch((error) => {
      if (error.code === 'ENOENT') return '';
      throw error;
    });
    if (existing.replace(/\r\n/g, '\n') !== contents) {
      throw new Error('People/people-data.js está desatualizado. Execute node scripts/build-people.mjs.');
    }
    console.log(`${total} perfis conferidos em People/people-data.js.`);
    return;
  }

  const temporary = join(dirname(outputFile), `.${basename(outputFile)}.${randomUUID()}.tmp`);
  try {
    await writeFile(temporary, contents, 'utf8');
    await rename(temporary, outputFile);
  } finally {
    await rm(temporary, { force: true });
  }
  console.log(`${total} perfis atualizados em People/people-data.js.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
