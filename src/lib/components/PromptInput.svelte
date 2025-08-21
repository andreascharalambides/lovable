<script lang="ts">
  import { appStore, canGenerate } from '../stores/app';
  import { PROMPT_TEMPLATES } from '../utils/prompts';

  export let onSubmit: (prompt: string) => void;
  export let conversationMode = false;

  let prompt = '';
  let showTemplates = false;
  let textareaElement: HTMLTextAreaElement;

  function handleSubmit() {
    const trimmedPrompt = prompt.trim();
    if (trimmedPrompt && $canGenerate) {
      onSubmit(trimmedPrompt);
      prompt = '';
      showTemplates = false;
    }
  }

  function useTemplate(template: string) {
    prompt = template;
    showTemplates = false;
    textareaElement?.focus();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  // Auto-resize textarea
  function autoResize() {
    if (textareaElement) {
      textareaElement.style.height = 'auto';
      textareaElement.style.height = textareaElement.scrollHeight + 'px';
    }
  }
</script>

<div class="prompt-container">
  <div class="prompt-header">
    <label for="prompt-input">
      {conversationMode ? 'Refine your component' : 'Describe your component'}
    </label>

    {#if !conversationMode}
      <button
              class="templates-btn"
              class:active={showTemplates}
              on:click={() => showTemplates = !showTemplates}
              type="button"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <line x1="9" y1="9" x2="15" y2="9"/>
          <line x1="9" y1="15" x2="13" y2="15"/>
        </svg>
        Templates
      </button>
    {/if}
  </div>

  {#if showTemplates && !conversationMode}
    <div class="templates-grid">
      {#each Object.entries(PROMPT_TEMPLATES) as [name, template]}
        <button
                class="template-card"
                on:click={() => useTemplate(template)}
                type="button"
        >
          <span class="template-name">{name}</span>
          <span class="template-preview">{template.substring(0, 60)}...</span>
        </button>
      {/each}
    </div>
  {/if}

  <div class="prompt-field">
    <textarea
            id="prompt-input"
            bind:this={textareaElement}
            bind:value={prompt}
            on:keydown={handleKeydown}
            on:input={autoResize}
            placeholder={conversationMode
        ? "Describe how you'd like to modify the component..."
        : "Create a modern dashboard with stats cards and charts..."}
            disabled={!$canGenerate}
            rows="3"
            maxlength="1000"
    />

    <div class="prompt-actions">
      <span class="char-counter" class:warning={prompt.length > 900}>
        {prompt.length}/1000
      </span>

      <button
              class="generate-btn"
              on:click={handleSubmit}
              disabled={!$canGenerate || !prompt.trim()}
              type="button"
      >
        {#if $appStore.isGenerating}
          <span class="spinner" />
          Generating...
        {:else}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16l4-4-4-4M8 12h8"/>
          </svg>
          Generate
        {/if}
      </button>
    </div>
  </div>

  <div class="prompt-hints">
    <span class="hint">
      <kbd>Enter</kbd> to generate
    </span>
    <span class="hint">
      <kbd>Shift + Enter</kbd> for new line
    </span>
    {#if conversationMode}
      <span class="hint mode">
        Iteration mode active
      </span>
    {/if}
  </div>
</div>

<style>
  .prompt-container {
    background: white;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 1.5rem;
    box-shadow: var(--shadow);
  }

  .prompt-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .prompt-header label {
    font-weight: 600;
    color: var(--text);
  }

  .templates-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: white;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--text-secondary);
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .templates-btn svg {
    width: 16px;
    height: 16px;
  }

  .templates-btn:hover,
  .templates-btn.active {
    background: var(--surface);
    color: var(--text);
  }

  .templates-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 0.75rem;
    margin-bottom: 1rem;
    padding: 1rem;
    background: var(--surface);
    border-radius: var(--radius);
  }

  .template-card {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 0.75rem;
    background: white;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
  }

  .template-card:hover {
    background: var(--primary);
    color: white;
    transform: translateY(-2px);
    box-shadow: var(--shadow);
  }

  .template-name {
    font-weight: 600;
    font-size: 0.875rem;
    text-transform: capitalize;
  }

  .template-preview {
    font-size: 0.75rem;
    opacity: 0.8;
    margin-top: 0.25rem;
  }

  .prompt-field {
    position: relative;
  }

  #prompt-input {
    width: 100%;
    padding: 1rem;
    padding-bottom: 3rem;
    background: var(--surface);
    border: 2px solid var(--border);
    border-radius: var(--radius);
    font-family: inherit;
    font-size: 1rem;
    line-height: 1.5;
    resize: none;
    transition: border-color 0.2s;
    min-height: 100px;
    max-height: 300px;
  }

  #prompt-input:focus {
    outline: none;
    border-color: var(--primary);
    background: white;
  }

  #prompt-input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .prompt-actions {
    position: absolute;
    bottom: 0.75rem;
    right: 0.75rem;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .char-counter {
    font-size: 0.75rem;
    color: var(--text-secondary);
  }

  .char-counter.warning {
    color: var(--error);
    font-weight: 600;
  }

  .generate-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: var(--radius);
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .generate-btn svg {
    width: 18px;
    height: 18px;
  }

  .generate-btn:hover:not(:disabled) {
    background: var(--primary-hover);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(255, 62, 0, 0.3);
  }

  .generate-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .spinner {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .prompt-hints {
    display: flex;
    gap: 1rem;
    margin-top: 0.5rem;
    font-size: 0.75rem;
    color: var(--text-secondary);
  }

  .hint kbd {
    padding: 0.125rem 0.375rem;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 4px;
    font-family: monospace;
    font-size: 0.75rem;
  }

  .hint.mode {
    color: var(--primary);
    font-weight: 600;
  }

  @media (max-width: 768px) {
    .templates-grid {
      grid-template-columns: 1fr;
    }

    .prompt-hints {
      flex-direction: column;
      gap: 0.25rem;
    }
  }
</style>