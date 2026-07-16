// ============================================================
// FileUploadManager — Client-side file reading & context extraction
// ============================================================

import type { UploadedFile } from './types';

const MAX_TEXT_LENGTH = 8000; // characters to send as context

/** Attempt to read a file and extract its text content. */
export async function processFile(file: File): Promise<UploadedFile> {
  const type = file.type;

  // Plain text files
  if (type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
    const text = await readAsText(file);
    return { name: file.name, type, size: file.size, textContent: truncate(text) };
  }

  // CSV files
  if (type === 'text/csv' || file.name.endsWith('.csv')) {
    const text = await readAsText(file);
    return { name: file.name, type, size: file.size, textContent: truncate(`CSV DATA:\n${text}`) };
  }

  // Images — convert to base64 preview
  if (type.startsWith('image/')) {
    const previewUrl = await readAsDataURL(file);
    return {
      name: file.name,
      type,
      size: file.size,
      textContent: `[Image uploaded: ${file.name}]`,
      previewUrl,
    };
  }

  // PDF — read as text (basic extraction without a library)
  if (type === 'application/pdf' || file.name.endsWith('.pdf')) {
    try {
      const text = await readAsText(file);
      // Strip PDF binary noise, keep readable text
      const cleaned = text
        .replace(/[^\x20-\x7E\u0900-\u097F\n\r\t]/g, ' ')
        .replace(/\s{3,}/g, ' ')
        .trim();
      return {
        name: file.name,
        type,
        size: file.size,
        textContent: truncate(`PDF CONTENT (${file.name}):\n${cleaned}`),
      };
    } catch {
      return { name: file.name, type, size: file.size, textContent: `[PDF: ${file.name} — could not extract text]` };
    }
  }

  // DOCX / DOC — read as text (basic)
  if (
    type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.name.endsWith('.docx') ||
    file.name.endsWith('.doc')
  ) {
    try {
      const text = await readAsText(file);
      const cleaned = text.replace(/[^\x20-\x7E\u0900-\u097F\n\r\t]/g, ' ').replace(/\s{3,}/g, ' ').trim();
      return {
        name: file.name,
        type,
        size: file.size,
        textContent: truncate(`DOCUMENT CONTENT (${file.name}):\n${cleaned}`),
      };
    } catch {
      return { name: file.name, type, size: file.size, textContent: `[Document: ${file.name}]` };
    }
  }

  // Fallback
  return { name: file.name, type, size: file.size, textContent: `[File: ${file.name}]` };
}

/** Build a context string to prepend to the user's chat message */
export function buildFileContext(file: UploadedFile): string {
  if (!file.textContent || file.textContent.startsWith('[')) return file.textContent;
  return `--- UPLOADED FILE: ${file.name} ---\n${file.textContent}\n--- END OF FILE ---\n\n`;
}

/** Accepts file types for the input element */
export const ACCEPTED_FILE_TYPES = '.pdf,.txt,.md,.csv,.doc,.docx,.png,.jpg,.jpeg,.webp,.gif';

/** Human-readable file size */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Helpers ──────────────────────────────────────────────────

function readAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file, 'UTF-8');
  });
}

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function truncate(text: string): string {
  return text.length > MAX_TEXT_LENGTH ? text.slice(0, MAX_TEXT_LENGTH) + '\n[... truncated ...]' : text;
}
