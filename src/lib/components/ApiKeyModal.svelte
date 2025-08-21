<script lang="ts">
    import {appStore} from '../stores/app';

    export let isOpen: boolean;
    export let apiKey: string;
    export let showKey: boolean = false;
    export let error: string | null = null;

    // Provided by parent
    export let saveApiKey: () => void;
    export let removeApiKey: () => void;

    function handleOverlayKey(e: KeyboardEvent) {
        if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
            isOpen = false;
        }
    }
</script>

{#if isOpen}
    <div
            class="modal-overlay"
            role="button"
            tabindex="0"
            aria-label="Close modal"
            on:click={(e) => { if (e.currentTarget === e.target) isOpen = false; }}
            on:keydown={handleOverlayKey}
    >
        <div
                class="modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="api-key-title"
                tabindex="-1"
                on:click|stopPropagation
                on:mousedown|stopPropagation
        >
            <div class="modal-header">
                <h2 id="api-key-title">OpenAI API Key</h2>
                <button
                        class="close-btn"
                        type="button"
                        on:click={() => (isOpen = false)}
                        aria-label="Close"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>

            <div class="modal-content">
                <p class="info">
                    Your API key is stored locally in your browser and never sent to any server except OpenAI.
                </p>

                <div class="input-group">
                    <label for="api-key">API Key</label>
                    <div class="input-wrapper">
                        {#if showKey}
                            <input
                                    id="api-key"
                                    type="text"
                                    bind:value={apiKey}
                                    placeholder="sk-..."
                                    autocomplete="off"
                                    autocapitalize="off"
                                    spellcheck="false"
                                    class="input api-input"
                            />
                        {:else}
                            <input
                                    id="api-key"
                                    type="password"
                                    bind:value={apiKey}
                                    placeholder="sk-..."
                                    autocomplete="off"
                                    autocapitalize="off"
                                    spellcheck="false"
                                    class="input api-input"
                            />
                        {/if}

                        <button
                                class="toggle-visibility"
                                type="button"
                                on:click={() => (showKey = !showKey)}
                                aria-label={showKey ? 'Hide API key' : 'Show API key'}
                        >
                            {#if showKey}
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                                    <line x1="1" y1="1" x2="23" y2="23"/>
                                </svg>
                            {:else}
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                    <circle cx="12" cy="12" r="3"/>
                                </svg>
                            {/if}
                        </button>
                    </div>
                </div>

                {#if error}
                    <p class="error-msg">{error}</p>
                {/if}

                <div class="help-text">
                    <p>
                        Get your API key from
                        <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener">OpenAI
                            Platform</a>
                    </p>
                </div>
            </div>

            <div class="modal-footer">
                {#if $appStore.apiKey}
                    <button class="btn-secondary" type="button" on:click={removeApiKey}>
                        Remove Key
                    </button>
                {/if}
                <button class="btn-primary" type="button" on:click={saveApiKey}>
                    Save Key
                </button>
            </div>
        </div>
    </div>
{/if}

<style>
    .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        animation: fadeIn 0.2s;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    .modal {
        background: var(--surface);
        border-radius: 16px;
        width: 90%;
        max-width: 480px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        animation: slideUp 0.3s;
    }

    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid var(--border);
    }

    .modal-header h2 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
    }

    .close-btn {
        background: transparent;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
        padding: 0.25rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        transition: all 0.2s;
    }

    .close-btn:hover {
        background: var(--hover);
        color: var(--text-primary);
    }

    .modal-content {
        padding: 1.5rem;
    }

    .info {
        margin-bottom: 1.5rem;
        padding: 0.75rem;
        background: var(--info-bg);
        color: var(--info-text);
        border-radius: 8px;
        font-size: 0.875rem;
        line-height: 1.5;
    }

    .input-group {
        margin-bottom: 1rem;
    }

    .input-group label {
        display: block;
        margin-bottom: 0.5rem;
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--text-secondary);
    }

    .input-wrapper {
        position: relative;
        display: flex;
        align-items: center;
    }

    .api-input {
        flex: 1;
        padding: 0.75rem;
        padding-right: 3rem;
        background: var(--background);
        border: 1px solid var(--border);
        border-radius: 8px;
        font-family: monospace;
        font-size: 0.875rem;
        color: var(--text-primary);
        transition: border-color 0.2s;
    }

    .api-input:focus {
        outline: none;
        border-color: var(--primary);
    }

    .toggle-visibility {
        position: absolute;
        right: 0.75rem;
        background: transparent;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
        padding: 0.25rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: all 0.2s;
    }

    .toggle-visibility:hover {
        background: var(--hover);
        color: var(--text-primary);
    }

    .error-msg {
        color: var(--error);
        font-size: 0.875rem;
        margin-top: 0.5rem;
    }

    .help-text {
        margin-top: 1rem;
        font-size: 0.875rem;
        color: var(--text-secondary);
    }

    .help-text a {
        color: var(--primary);
        text-decoration: none;
    }

    .help-text a:hover {
        text-decoration: underline;
    }

    .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        padding: 1.5rem;
        border-top: 1px solid var(--border);
    }

    .btn-primary, .btn-secondary {
        padding: 0.625rem 1.25rem;
        border-radius: 8px;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        border: none;
    }

    .btn-primary {
        background: var(--primary);
        color: white;
    }

    .btn-primary:hover {
        background: var(--primary-dark);
        transform: scale(1.02);
    }

    .btn-secondary {
        background: transparent;
        color: var(--text-secondary);
        border: 1px solid var(--border);
    }

    .btn-secondary:hover {
        background: var(--hover);
        color: var(--text-primary);
    }
</style>
