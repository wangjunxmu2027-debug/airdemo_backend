import { mkdir, writeFile, access } from 'node:fs/promises';
import path from 'node:path';

import {
  StorageProvider,
  StorageUploadOptions,
  StorageUploadResult,
  StorageDownloadUploadOptions,
} from './index';

export class LocalProvider implements StorageProvider {
  readonly name = 'local';
  configs: Record<string, any>;
  private uploadPath: string;
  private baseDir: string;

  constructor(configs: Record<string, any> = {}) {
    this.configs = configs;
    this.uploadPath = (configs.uploadPath || 'uploads').replace(/^\/|\/$/g, '');
    this.baseDir = path.join(process.cwd(), 'public', this.uploadPath);
  }

  async exists(options: { key: string }): Promise<boolean> {
    try {
      await access(path.join(this.baseDir, options.key));
      return true;
    } catch {
      return false;
    }
  }

  getPublicUrl(options: { key: string }): string {
    return `/${this.uploadPath}/${options.key}`;
  }

  async uploadFile(options: StorageUploadOptions): Promise<StorageUploadResult> {
    await mkdir(this.baseDir, { recursive: true });
    const filePath = path.join(this.baseDir, options.key);
    const buffer = Buffer.isBuffer(options.body)
      ? options.body
      : Buffer.from(options.body);
    await writeFile(filePath, buffer);
    return {
      success: true,
      key: options.key,
      url: this.getPublicUrl({ key: options.key }),
      provider: this.name,
      uploadPath: this.uploadPath,
    };
  }

  async downloadAndUpload(
    options: StorageDownloadUploadOptions
  ): Promise<StorageUploadResult> {
    const response = await fetch(options.url);
    if (!response.ok) {
      return {
        success: false,
        provider: this.name,
        error: `Download failed with status ${response.status}`,
      };
    }
    const buffer = new Uint8Array(await response.arrayBuffer());
    return this.uploadFile({
      body: buffer,
      key: options.key,
      contentType: options.contentType,
      disposition: options.disposition,
    });
  }
}
