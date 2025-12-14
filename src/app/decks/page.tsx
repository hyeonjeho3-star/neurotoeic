'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { Plus, Trash2, ChevronRight, Download, FileDown, CheckCircle, XCircle } from 'lucide-react';
import { useDeckStore } from '@/stores/deckStore';
import { parseFile } from '@/lib/parser';

const SAMPLE_DECKS = [
  { name: 'TOEIC Verb Patterns', file: '/samples/toeic-verb-patterns.md' },
  { name: 'TOEIC Vocabulary', file: '/samples/toeic-vocabulary.md' },
];

const TEMPLATES = [
  { name: 'Cloze 형식 (빈칸 채우기)', file: '/samples/template-cloze.md', desc: '{{c1::정답::힌트}} 형식' },
  { name: 'Q&A 형식 (질문/답변)', file: '/samples/template-qa.md', desc: 'Q: 질문 / A: 답변 형식' },
  { name: 'Simple 형식 (단순)', file: '/samples/template-simple.txt', desc: '앞면 | 뒷면 형식' },
];

interface ImportResult {
  fileName: string;
  success: boolean;
  deckName?: string;
  cardCount?: number;
  error?: string;
}

export default function DecksPage() {
  const { decks, deckStats, importDeck, deleteDeck } = useDeckStore();
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importResults, setImportResults] = useState<ImportResult[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setImporting(true);
    setError(null);
    setImportResults([]);

    const results: ImportResult[] = [];

    for (const file of Array.from(files)) {
      try {
        const content = await file.text();
        const result = parseFile(content, file.name);

        if (!result.success || !result.deck) {
          results.push({
            fileName: file.name,
            success: false,
            error: result.errors.map((e) => e.message).join(', ') || 'Failed to parse file',
          });
          continue;
        }

        await importDeck(result.deck);
        results.push({
          fileName: file.name,
          success: true,
          deckName: result.deck.name,
          cardCount: result.deck.cards.length,
        });
      } catch (err) {
        results.push({
          fileName: file.name,
          success: false,
          error: err instanceof Error ? err.message : 'Failed to import deck',
        });
      }
    }

    setImportResults(results);
    setImporting(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Show error summary if any failed
    const failedCount = results.filter(r => !r.success).length;
    if (failedCount > 0 && failedCount === results.length) {
      setError(`모든 파일 임포트 실패 (${failedCount}개)`);
    }
  };

  const handleImportSample = async (sampleFile: string) => {
    setImporting(true);
    setError(null);

    try {
      const response = await fetch(sampleFile);
      const content = await response.text();
      const fileName = sampleFile.split('/').pop() || 'sample.md';
      const result = parseFile(content, fileName);

      if (!result.success || !result.deck) {
        setError(result.errors.map((e) => e.message).join('\n') || 'Failed to parse sample');
        return;
      }

      await importDeck(result.deck);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import sample deck');
    } finally {
      setImporting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Delete "${name}"? This cannot be undone.`)) {
      await deleteDeck(id);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Decks</h1>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={importing}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          <Plus size={20} />
          Import
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md,.markdown"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Importing Progress */}
      {importing && (
        <div className="mb-4 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="animate-spin w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full" />
            <p className="text-orange-700 dark:text-orange-400 font-medium">덱 임포트 중...</p>
          </div>
        </div>
      )}

      {/* Import Results */}
      {!importing && importResults.length > 0 && (
        <div className="mb-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              임포트 결과 ({importResults.filter(r => r.success).length}/{importResults.length} 성공)
            </h3>
            <button
              onClick={() => setImportResults([])}
              className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              닫기
            </button>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {importResults.map((result, index) => (
              <div
                key={index}
                className={`flex items-start gap-2 p-2 rounded ${
                  result.success
                    ? 'bg-green-50 dark:bg-green-900/20'
                    : 'bg-red-50 dark:bg-red-900/20'
                }`}
              >
                {result.success ? (
                  <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={18} />
                ) : (
                  <XCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
                )}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${
                    result.success ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                  }`}>
                    {result.fileName}
                  </p>
                  {result.success ? (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {result.deckName} • {result.cardCount}장
                    </p>
                  ) : (
                    <p className="text-xs text-red-600 dark:text-red-400">{result.error}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
          <p className="text-red-700 dark:text-red-400 text-sm whitespace-pre-wrap">{error}</p>
        </div>
      )}

      {decks.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No decks yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Import a .md or .txt file to create your first deck
          </p>

          {/* Sample Decks */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 max-w-md mx-auto">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-left">
              Or try a sample deck:
            </h4>
            <div className="space-y-2">
              {SAMPLE_DECKS.map((sample) => (
                <button
                  key={sample.file}
                  onClick={() => handleImportSample(sample.file)}
                  disabled={importing}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors text-left disabled:opacity-50"
                >
                  <span className="text-gray-700 dark:text-gray-300">{sample.name}</span>
                  <Download size={18} className="text-orange-500" />
                </button>
              ))}
            </div>
          </div>

          {/* Download Templates */}
          <div className="mt-8 text-left max-w-lg mx-auto">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
              템플릿 다운로드:
            </h4>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-2">
              {TEMPLATES.map((template) => (
                <a
                  key={template.file}
                  href={template.file}
                  download
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  <div>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{template.name}</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{template.desc}</p>
                  </div>
                  <FileDown size={18} className="text-blue-500" />
                </a>
              ))}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
              템플릿을 다운로드하여 내용을 수정한 후 Import 버튼으로 업로드하세요.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Sample Decks & Templates */}
          <div className="mb-4 space-y-2">
            <details className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <summary className="p-4 cursor-pointer font-medium text-gray-700 dark:text-gray-300 hover:text-orange-500">
                샘플 덱 불러오기
              </summary>
              <div className="px-4 pb-4 space-y-2">
                {SAMPLE_DECKS.map((sample) => (
                  <button
                    key={sample.file}
                    onClick={() => handleImportSample(sample.file)}
                    disabled={importing}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors text-left disabled:opacity-50"
                  >
                    <span className="text-gray-700 dark:text-gray-300">{sample.name}</span>
                    <Download size={18} className="text-orange-500" />
                  </button>
                ))}
              </div>
            </details>
            <details className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <summary className="p-4 cursor-pointer font-medium text-gray-700 dark:text-gray-300 hover:text-blue-500">
                템플릿 다운로드
              </summary>
              <div className="px-4 pb-4 space-y-2">
                {TEMPLATES.map((template) => (
                  <a
                    key={template.file}
                    href={template.file}
                    download
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    <div>
                      <span className="text-gray-700 dark:text-gray-300">{template.name}</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{template.desc}</p>
                    </div>
                    <FileDown size={18} className="text-blue-500" />
                  </a>
                ))}
              </div>
            </details>
          </div>

          <div className="space-y-3">
            {decks.map((deck) => {
              const stats = deckStats[deck.id];

              return (
                <div
                  key={deck.id}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
                >
                  <div className="flex items-start justify-between">
                    <Link href={`/deck/${deck.id}`} className="flex-1 group">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-orange-500 transition-colors">
                          {deck.name}
                        </h3>
                        <ChevronRight className="text-gray-400 group-hover:text-orange-500" size={20} />
                      </div>
                      {deck.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                          {deck.description}
                        </p>
                      )}
                    </Link>
                    <button
                      onClick={() => handleDelete(deck.id, deck.name)}
                      className="ml-2 p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="flex gap-6 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Cards: </span>
                      <span className="font-medium text-gray-900 dark:text-white">{deck.cardCount}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">New: </span>
                      <span className="font-medium text-green-500">{stats?.newCards ?? 0}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Due: </span>
                      <span className="font-medium text-orange-500">{stats?.dueToday ?? 0}</span>
                    </div>
                  </div>

                  {deck.tags.length > 0 && (
                    <div className="flex gap-2 mt-3">
                      {deck.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
