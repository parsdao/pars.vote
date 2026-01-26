/**
 * Hook to fetch and manage PIPs (PARS Improvement Proposals)
 *
 * Fetches PIPs from the GitHub repository and parses their metadata.
 */

import { useCallback, useEffect, useState } from 'react';
import { PIP, PIPMetadata, PIPStatus, PIPType, getPIPCategory } from '../../types/pip';

const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com';
const REPO_OWNER = 'cyrusdao';
const REPO_NAME = 'pips';
const PIPS_PATH = 'PIPs';

interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: string;
}

/**
 * Parse YAML frontmatter from PIP content
 */
function parseYAMLFrontmatter(content: string): Record<string, string> {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return {};

  const yaml = frontmatterMatch[1];
  const result: Record<string, string> = {};

  yaml.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      result[key] = value;
    }
  });

  return result;
}

/**
 * Parse PIP metadata from markdown content (supports YAML frontmatter)
 */
function parsePIPMetadata(content: string, fileName: string): PIPMetadata | null {
  // Extract PIP number from filename (e.g., pip-0001-constitution.md -> 0001)
  const numberMatch = fileName.match(/pip-(\d+)/i);
  if (!numberMatch) return null;

  const number = numberMatch[1];

  // Try YAML frontmatter first (lux/lps format)
  const frontmatter = parseYAMLFrontmatter(content);

  if (frontmatter.title) {
    return {
      number: String(frontmatter.pip || number).padStart(4, '0'),
      title: frontmatter.title,
      status: (frontmatter.status as PIPStatus) || 'Draft',
      type: (frontmatter.category as PIPType) || (frontmatter.type as PIPType) || getPIPCategory(number),
      created: frontmatter.created || new Date().toISOString().split('T')[0],
      discussionUrl: frontmatter['discussions-to'] || null,
      description: frontmatter.description || null,
      author: frontmatter.author || null,
      tags: frontmatter.tags ? frontmatter.tags.replace(/[\[\]]/g, '').split(',').map(t => t.trim()) : [],
    };
  }

  // Fallback: Extract title from first heading
  const titleMatch = content.match(/^#\s+PIP-\d+[a-z]?:\s*(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : fileName.replace(/\.md$/, '').replace(/pip-\d+-/i, '').replace(/-/g, ' ');

  // Fallback: Extract metadata table if exists (old format)
  const tableMatch = content.match(/\|\s*\d+[a-z]?\s*\|[^|]+\|\s*(\w+)\s*\|\s*(\w+)\s*\|\s*([\d-]+)\s*\|\s*\[?[^\]|]*\]?\(?([^)|\s]*)\)?/i);

  let status: PIPStatus = 'Draft';
  let type: PIPType = getPIPCategory(number);
  let created = new Date().toISOString().split('T')[0];
  let discussionUrl: string | null = null;

  if (tableMatch) {
    status = (tableMatch[1] as PIPStatus) || 'Draft';
    type = (tableMatch[2] as PIPType) || getPIPCategory(number);
    created = tableMatch[3] || created;
    discussionUrl = tableMatch[4] && tableMatch[4].startsWith('http') ? tableMatch[4] : null;
  }

  return {
    number,
    title,
    status,
    type,
    created,
    discussionUrl,
  };
}

/**
 * Extract summary from PIP content (first paragraph after preamble/title)
 */
function extractSummary(content: string): string {
  // Skip title, metadata table, and dividers
  const lines = content.split('\n');
  let inPreamble = false;
  let foundContent = false;
  const summaryLines: string[] = [];

  for (const line of lines) {
    // Skip title
    if (line.startsWith('# ')) continue;
    // Skip metadata table
    if (line.includes('|') && (line.includes('PIP') || line.includes('Status') || line.includes('---'))) continue;
    // Skip dividers
    if (line.trim() === '---') {
      if (foundContent) break;
      continue;
    }
    // Skip blockquotes (preamble)
    if (line.startsWith('>')) {
      inPreamble = true;
      continue;
    }
    if (inPreamble && !line.startsWith('>') && line.trim() !== '') {
      inPreamble = false;
    }
    if (inPreamble) continue;
    // Skip headers
    if (line.startsWith('#')) {
      if (foundContent) break;
      continue;
    }
    // Collect content
    if (line.trim()) {
      foundContent = true;
      summaryLines.push(line);
      if (summaryLines.length >= 3) break;
    }
  }

  return summaryLines.join(' ').replace(/\s+/g, ' ').trim().slice(0, 300);
}

export interface UsePIPsResult {
  pips: PIP[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function usePIPs(): UsePIPsResult {
  const [pips, setPIPs] = useState<PIP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPIPs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch list of PIP files from GitHub API
      const listResponse = await fetch(
        `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${PIPS_PATH}`,
        {
          headers: {
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );

      if (!listResponse.ok) {
        throw new Error(`Failed to fetch PIPs list: ${listResponse.statusText}`);
      }

      const files: GitHubFile[] = await listResponse.json();

      // Filter for markdown files that match PIP naming convention
      const pipFiles = files.filter(
        (f) => f.type === 'file' && f.name.endsWith('.md') && /^pip-\d+/i.test(f.name)
      );

      // Fetch content for each PIP
      const pipPromises = pipFiles.map(async (file): Promise<PIP | null> => {
        try {
          const contentResponse = await fetch(file.download_url);
          if (!contentResponse.ok) return null;

          const content = await contentResponse.text();
          const metadata = parsePIPMetadata(content, file.name);
          if (!metadata) return null;

          return {
            ...metadata,
            id: file.name.replace('.md', ''),
            fileName: file.name,
            content,
            summary: extractSummary(content),
            rawUrl: file.download_url,
            repoUrl: file.html_url,
          };
        } catch {
          return null;
        }
      });

      const fetchedPIPs = (await Promise.all(pipPromises)).filter((p): p is PIP => p !== null);

      // Sort by PIP number
      fetchedPIPs.sort((a, b) => parseInt(a.number, 10) - parseInt(b.number, 10));

      setPIPs(fetchedPIPs);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch PIPs'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPIPs();
  }, [fetchPIPs]);

  return { pips, loading, error, refetch: fetchPIPs };
}

export interface UsePIPResult {
  pip: PIP | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook to fetch a single PIP by its ID
 */
export function usePIP(pipId: string | undefined): UsePIPResult {
  const [pip, setPIP] = useState<PIP | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!pipId) {
      setLoading(false);
      return;
    }

    const fetchPIP = async () => {
      setLoading(true);
      setError(null);

      try {
        const fileName = pipId.endsWith('.md') ? pipId : `${pipId}.md`;
        const url = `${GITHUB_RAW_BASE}/${REPO_OWNER}/${REPO_NAME}/main/${PIPS_PATH}/${fileName}`;

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`PIP not found: ${pipId}`);
        }

        const content = await response.text();
        const metadata = parsePIPMetadata(content, fileName);

        if (!metadata) {
          throw new Error(`Invalid PIP format: ${pipId}`);
        }

        setPIP({
          ...metadata,
          id: pipId,
          fileName,
          content,
          summary: extractSummary(content),
          rawUrl: url,
          repoUrl: `https://github.com/${REPO_OWNER}/${REPO_NAME}/blob/main/${PIPS_PATH}/${fileName}`,
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch PIP'));
        setPIP(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPIP();
  }, [pipId]);

  return { pip, loading, error };
}
