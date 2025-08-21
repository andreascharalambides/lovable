<script lang="ts">
  import { onMount, afterUpdate } from 'svelte';

  export let code = '';
  export let language = 'svelte';

  let codeElement: HTMLElement;
  let lineNumbers: number[] = [];
  let copied = false;
  let copyTimeout: number;

  $: lineNumbers = code.split('\n').map((_, i) => i + 1);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      copied = true;
      clearTimeout(copyTimeout);
      copyTimeout = setTimeout(() => copied = false, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  function downloadCode() {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `component-${Date.now()}.svelte`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function highlightSyntax() {
    if (!codeElement) return;

    // Simple syntax highlighting for Svelte
    let highlighted = code
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

    // Highlight different parts
    highlighted = highlighted
            // Strings
            .replace(/(['"`])(.*?)\1/g, '<span class="string">$1$2$1</span>')
            // Comments
            .replace(/(\/\/.*$)/gm, '<span class="comment">$1</span>')
            .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="comment">$1</span>')
            // Keywords
            .replace(/\b(const|let|var|function|return|if|else|for|while|import|export|from|as|async|await|class|extends|new|this|super|try|catch|throw|typeof|instanceof|in|of|break|continue|switch|case|default|do)\b/g, '<span class="keyword">$1</span>')
            // Numbers
            .replace(/\b(\d+)\b/g, '<span class="number">$1</span>')
            // Svelte specific
            .replace(/(\$:|\{#|\{\/|\{:|\{\$)/g, '<span class="svelte">$1</span>')
            // HTML tags
            .replace(/(&lt;\/?)([\w-]+)(.*?)(&gt;)/g, '$1<span class="tag">$2</span>$3$4');

    codeElement.innerHTML = highlighted;
  }

  onMount(highlightSyntax);
  afterUpdate(highlightSyntax);
</script>

<div class="code-viewer">
  <div class="code-header">
    <div class="code-info">
      <span class="language-badge">{language.toUpperCase()}</span>
      <span class="line-count">{lineNumbers.length} lines</span>
    </div>

    <div class="code-actions">
      <button
              class="action-btn"
              on:click={copyCode}
              title="Copy code"
      >
        {#if copied}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Copied!
        {:else}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="9" y="9" width="13" height="13" rx="2"/>
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
          </svg>
          Copy
        {/if}
      </button>

      <button
              class="action-btn"
              on:click={downloadCode}
              title="Download code"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Download
      </button>
    </div>
  </div>

  <div class="code-body">
    <div class="line-numbers">
      {#each lineNumbers as lineNumber}
        <div class="line-number">{lineNumber}</div>
      {/each}
    </div>

    <div class="code-content">
      <pre><code bind:this={codeElement}>{code}</code></pre>
    </div>
  </div>
</div>

<style>
  .code-viewer {
    border: 1px solid var(--border);
    overflow: hidden;
    background: #1e1e1e;
  }

  .code-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background: #2d2d30;
    border-bottom: 1px solid #3e3e42;
  }

  .code-info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .language-badge {
    padding: 0.25rem 0.5rem;
    background: var(--primary);
    color: white;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .line-count {
    color: #969696;
    font-size: 0.875rem;
  }

  .code-actions {
    display: flex;
    gap: 0.5rem;
  }

  .action-btn {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.375rem 0.75rem;
    background: #3e3e42;
    border: 1px solid #464647;
    border-radius: 4px;
    color: #cccccc;
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .action-btn svg {
    width: 14px;
    height: 14px;
  }

  .action-btn:hover {
    background: #464647;
    color: white;
  }

  .code-body {
    display: flex;
    max-height: 600px;
    overflow: auto;
  }

  .line-numbers {
    padding: 1rem 0;
    background: #2d2d30;
    border-right: 1px solid #3e3e42;
    user-select: none;
  }

  .line-number {
    padding: 0 1rem;
    color: #858585;
    font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
    font-size: 0.875rem;
    line-height: 1.5;
    text-align: right;
  }

  .code-content {
    flex: 1;
    padding: 1rem;
    overflow-x: auto;
  }

  pre {
    margin: 0;
    font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
    font-size: 0.875rem;
    line-height: 1.5;
  }

  code {
    color: #d4d4d4;
  }

  /* Syntax highlighting */
  :global(.code-content .string) { color: #ce9178; }
  :global(.code-content .comment) { color: #6a9955; }
  :global(.code-content .keyword) { color: #569cd6; }
  :global(.code-content .number) { color: #b5cea8; }
  :global(.code-content .svelte) { color: #c586c0; }
  :global(.code-content .tag) { color: #569cd6; }

  /* Scrollbar styling */
  .code-body::-webkit-scrollbar {
    width: 12px;
    height: 12px;
  }

  .code-body::-webkit-scrollbar-track {
    background: #1e1e1e;
  }

  .code-body::-webkit-scrollbar-thumb {
    background: #464647;
    border-radius: 6px;
  }

  .code-body::-webkit-scrollbar-thumb:hover {
    background: #5a5a5a;
  }

  @media (max-width: 768px) {
    .code-body {
      max-height: 400px;
    }

    .line-numbers {
      padding: 0.75rem 0;
    }

    .line-number {
      padding: 0 0.5rem;
      font-size: 0.75rem;
    }

    .code-content {
      padding: 0.75rem;
    }

    pre {
      font-size: 0.75rem;
    }
  }
</style>