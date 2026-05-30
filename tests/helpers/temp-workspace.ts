import { copyFile, mkdir, mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { testAssetsDir } from "./fixtures";

const originalCwd = process.cwd();

export function hasFixture(name: string): boolean {
  try {
    return Bun.file(join(testAssetsDir, name)).size > 0;
  } catch {
    return false;
  }
}

export async function hasMediaBinaries(): Promise<boolean> {
  const checks = await Promise.all([
    Bun.which("magick"),
    Bun.which("ffmpeg"),
    Bun.which("whisper-cli"),
  ]);
  return checks.every(Boolean);
}

export interface TempWorkspace {
  dir: string;
  srcDir: string;
}

export async function withTempWorkspace<T>(
  fn: (workspace: TempWorkspace) => Promise<T>,
  files?: string[],
): Promise<T> {
  const dir = await mkdtemp(join(tmpdir(), "invoice-test-"));
  const srcDir = join(dir, "src");
  await mkdir(srcDir, { recursive: true });

  const toCopy =
    files ??
    (await readdir(testAssetsDir).catch(() => [] as string[])).filter(
      (name) => !name.startsWith("."),
    );

  for (const name of toCopy) {
    await copyFile(join(testAssetsDir, name), join(dir, name));
  }

  process.chdir(dir);

  try {
    return await fn({ dir, srcDir });
  } finally {
    process.chdir(originalCwd);
    await rm(dir, { recursive: true, force: true });
  }
}

export async function withTempWorkspaceFile<T>(
  fileName: string,
  content: Uint8Array | string,
  fn: (workspace: TempWorkspace) => Promise<T>,
): Promise<T> {
  const dir = await mkdtemp(join(tmpdir(), "invoice-test-"));
  const srcDir = join(dir, "src");
  await mkdir(srcDir, { recursive: true });
  await Bun.write(join(dir, fileName), content);

  process.chdir(dir);

  try {
    return await fn({ dir, srcDir });
  } finally {
    process.chdir(originalCwd);
    await rm(dir, { recursive: true, force: true });
  }
}
