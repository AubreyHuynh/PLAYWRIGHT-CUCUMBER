import * as fs from 'fs';
import * as path from 'path';
import { Page } from '@playwright/test';

export class FileHelper {
  static readonly UPLOAD_DIR = path.resolve(process.cwd(), 'src/data/files');
  static readonly DOWNLOAD_DIR = path.resolve(process.cwd(), 'downloads');

  static getUploadPath(filename: string): string {
    return path.join(FileHelper.UPLOAD_DIR, filename);
  }

  static ensureDownloadDir(): void {
    if (!fs.existsSync(FileHelper.DOWNLOAD_DIR)) {
      fs.mkdirSync(FileHelper.DOWNLOAD_DIR, { recursive: true });
    }
  }

  /** Upload one or more files via input[type=file] */
  static async upload(page: Page, selector: string, ...filenames: string[]): Promise<void> {
    const paths = filenames.map((f) => FileHelper.getUploadPath(f));
    await page.setInputFiles(selector, paths);
  }

  static cleanDownloads(): void {
    if (fs.existsSync(FileHelper.DOWNLOAD_DIR)) {
      fs.readdirSync(FileHelper.DOWNLOAD_DIR).forEach((f) => fs.unlinkSync(path.join(FileHelper.DOWNLOAD_DIR, f)));
    }
  }

  static readJson<T>(filePath: string): T {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
  }
}
