#!/usr/bin/env node
/**
 * Construye los ZIPs del press kit en /public/press/.
 *
 * Idempotente: borra y regenera los 4 archivos en cada ejecución.
 *
 * Genera:
 *   - shadow-games-logos.zip       — logos del estudio (SVG + PNG cuando exista)
 *   - shadow-games-key-arts.zip    — key arts por juego (placeholder fase 1)
 *   - shadow-games-screenshots.zip — capturas por juego (placeholder fase 1)
 *   - shadow-games-press-kit.zip   — ZIP maestro con todo + README.txt
 *
 * Uso:
 *   npm run press:zip
 *
 * TODO al regenerar cuando lleguen assets reales:
 *   - Sustituir public/brand/logo.svg por los 3 archivos definitivos
 *     (mark.svg, wordmark.svg, full.svg) + sus PNG (1x, 2x).
 *   - Añadir key arts en public/games/<slug>/key-art.jpg.
 *   - Añadir screenshots en public/games/<slug>/screen-N.jpg.
 *   - Re-ejecutar este script.
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import AdmZip from "adm-zip";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const PUBLIC_DIR = join(ROOT, "public");
const OUT_DIR = join(PUBLIC_DIR, "press");
const BRAND_DIR = join(PUBLIC_DIR, "brand");
const GAMES_DIR = join(PUBLIC_DIR, "games");

const README = `Shadow Games — Press kit
========================

Este press kit es una versión preliminar (fase 1).

Los logos incluidos son los placeholders actuales del estudio.
Cuando los assets definitivos del logo lleguen (mark / wordmark /
full, en SVG y PNG), regenera este ZIP con:

    npm run press:zip

Las carpetas de key-arts/ y screenshots/ están vacías o
incompletas en esta fase: se irán llenando a medida que cada
juego cierre su material visual.

Contacto de prensa: shadowgames.devteam@gmail.com
Web: https://shadowgames.studio
`;

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function safeRm(file) {
  if (existsSync(file)) rmSync(file);
}

/** Walks a directory recursively and returns { absPath, relPath } for each file. */
function walk(dir, rootForRel = dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir)) {
    const abs = join(dir, entry);
    const s = statSync(abs);
    if (s.isDirectory()) {
      out.push(...walk(abs, rootForRel));
    } else {
      out.push({ absPath: abs, relPath: relative(rootForRel, abs).replace(/\\/g, "/") });
    }
  }
  return out;
}

/** Build the logos ZIP. */
function buildLogosZip() {
  const zip = new AdmZip();
  let added = 0;
  if (existsSync(BRAND_DIR)) {
    for (const f of walk(BRAND_DIR)) {
      zip.addFile(`logos/${f.relPath}`, readFileSync(f.absPath));
      added++;
    }
  }
  zip.addFile(
    "README.txt",
    Buffer.from(
      added === 0
        ? `${README}\n[!] Esta carpeta está vacía. Aún no hay assets de logo en public/brand/.`
        : `${README}\nLogos incluidos: ${added} archivo(s).`,
      "utf8",
    ),
  );
  const out = join(OUT_DIR, "shadow-games-logos.zip");
  safeRm(out);
  zip.writeZip(out);
  return { path: out, count: added };
}

/** Build the key-arts ZIP (or empty placeholder). */
function buildKeyArtsZip() {
  const zip = new AdmZip();
  let added = 0;
  if (existsSync(GAMES_DIR)) {
    for (const slug of readdirSync(GAMES_DIR)) {
      const ka = join(GAMES_DIR, slug, "key-art.jpg");
      if (existsSync(ka)) {
        zip.addFile(`key-arts/${slug}.jpg`, readFileSync(ka));
        added++;
      }
    }
  }
  zip.addFile(
    "README.txt",
    Buffer.from(
      added === 0
        ? `${README}\n[!] No hay key arts disponibles aún. Esta carpeta se actualizará a medida que cada juego cierre su material visual definitivo.`
        : `${README}\nKey arts incluidos: ${added} archivo(s).`,
      "utf8",
    ),
  );
  const out = join(OUT_DIR, "shadow-games-key-arts.zip");
  safeRm(out);
  zip.writeZip(out);
  return { path: out, count: added };
}

/** Build the screenshots ZIP (or empty placeholder). */
function buildScreenshotsZip() {
  const zip = new AdmZip();
  let added = 0;
  if (existsSync(GAMES_DIR)) {
    for (const slug of readdirSync(GAMES_DIR)) {
      const gameDir = join(GAMES_DIR, slug);
      if (!statSync(gameDir).isDirectory()) continue;
      for (const f of readdirSync(gameDir)) {
        if (/^screen-\d+\.(jpg|png|webp)$/i.test(f)) {
          zip.addFile(`screenshots/${slug}/${f}`, readFileSync(join(gameDir, f)));
          added++;
        }
      }
    }
  }
  zip.addFile(
    "README.txt",
    Buffer.from(
      added === 0
        ? `${README}\n[!] No hay screenshots disponibles aún. Esta carpeta se actualizará a medida que cada juego cierre su material visual definitivo.`
        : `${README}\nScreenshots incluidos: ${added} archivo(s).`,
      "utf8",
    ),
  );
  const out = join(OUT_DIR, "shadow-games-screenshots.zip");
  safeRm(out);
  zip.writeZip(out);
  return { path: out, count: added };
}

/** Build the master ZIP combining all of the above + a top-level README. */
function buildMasterZip(parts) {
  const zip = new AdmZip();
  // Add a top-level README at the root of the master ZIP.
  zip.addFile("README.txt", Buffer.from(README, "utf8"));
  // Embed each sub-zip as a folder of raw files, not as a zip-inside-zip.
  for (const p of parts) {
    const sub = new AdmZip(p.path);
    for (const entry of sub.getEntries()) {
      if (entry.isDirectory) continue;
      zip.addFile(entry.entryName, entry.getData());
    }
  }
  const out = join(OUT_DIR, "shadow-games-press-kit.zip");
  safeRm(out);
  zip.writeZip(out);
  return { path: out };
}

function fmt(p) {
  return relative(ROOT, p).replace(/\\/g, "/");
}

function main() {
  ensureDir(OUT_DIR);
  const logos = buildLogosZip();
  const keyArts = buildKeyArtsZip();
  const screenshots = buildScreenshotsZip();
  const master = buildMasterZip([logos, keyArts, screenshots]);
  console.log("Press kit generated:");
  console.log(`  ${fmt(logos.path)}        (${logos.count} files)`);
  console.log(`  ${fmt(keyArts.path)}      (${keyArts.count} files)`);
  console.log(`  ${fmt(screenshots.path)}  (${screenshots.count} files)`);
  console.log(`  ${fmt(master.path)}  (master)`);
}

main();
