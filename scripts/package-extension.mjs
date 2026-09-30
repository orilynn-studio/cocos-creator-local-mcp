/** Copyright 2026 InnoLotus Pty Ltd. Licensed under Apache-2.0. */
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const extensionRoot = join(repositoryRoot, 'packages', 'cocos-extension');
const artifactRoot = join(repositoryRoot, 'artifacts', 'agent-bridge');

/** Produces the exact extension directory that users extract under extensions/. */
async function packageExtension() {
    await rm(artifactRoot, { recursive: true, force: true });
    await mkdir(artifactRoot, { recursive: true });

    await Promise.all([
        cp(join(extensionRoot, 'dist'), join(artifactRoot, 'dist'), { recursive: true }),
        cp(join(extensionRoot, 'static'), join(artifactRoot, 'static'), { recursive: true }),
        cp(join(repositoryRoot, 'LICENSE'), join(artifactRoot, 'LICENSE')),
        cp(join(repositoryRoot, 'NOTICE'), join(artifactRoot, 'NOTICE')),
    ]);

    const sourceManifest = JSON.parse(await readFile(join(extensionRoot, 'package.json'), 'utf8'));
    const releaseManifest = {
        name: sourceManifest.name,
        package_version: sourceManifest.package_version,
        version: sourceManifest.version,
        author: sourceManifest.author,
        license: sourceManifest.license,
        editor: sourceManifest.editor,
        main: sourceManifest.main,
        panels: sourceManifest.panels,
        contributions: sourceManifest.contributions,
    };
    await writeFile(join(artifactRoot, 'package.json'), `${JSON.stringify(releaseManifest, null, 2)}\n`);
    await writeFile(join(artifactRoot, 'README.md'), `# Agent Bridge\n\nExtract this directory into <project>/extensions/agent-bridge, then restart Cocos Creator.\n\nThis release binds only to 127.0.0.1.\n`);
    console.log(`Prepared extension artifact: ${artifactRoot}`);
}

await packageExtension();
