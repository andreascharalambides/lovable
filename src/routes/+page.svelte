<script lang="ts">
    import {onMount} from 'svelte';
    import {appStore, hasApiKey} from '$lib/stores/app';
    import {historyStore, canUndo, canRedo} from '$lib/stores/history';
    import {llmService} from '$lib/services/llm';
    import {storageService} from '$lib/services/storage';
    import {validatePrompt, generateIterationPrompt} from '$lib/utils/prompts';
    import type {GeneratedPage} from '$lib/stores/app';

    import PromptInput from '$lib/components/PromptInput.svelte';
    import CodeViewer from '$lib/components/CodeViewer.svelte';
    import ApiKeyModal from '$lib/components/ApiKeyModal.svelte';
    import ConversationPanel from '$lib/components/ConversationPanel.svelte';

    let showApiKeyModal = false;
    let showConversation = false;
    let conversationMode = false;
    let apiKey = '';
    let showKey = false;
    let apiKeyError: string | null = null;

    onMount(async () => {
        await storageService.initialize();

        const savedKey = storageService.getApiKey();
        if (savedKey) {
            apiKey = savedKey;
            appStore.setApiKey(savedKey);
            llmService.initialize(savedKey);
        } else {
            showApiKeyModal = true;
        }

        const pages = await storageService.getAllPages();
        if (pages.length > 0) {
            historyStore.loadHistory(pages);
            const latest = pages[pages.length - 1];
            appStore.setCurrentPage(latest);
            conversationMode = true;
        }
    });

    function saveApiKey() {
        if (!apiKey.trim()) {
            apiKeyError = 'Please enter an API key';
            return;
        }

        if (!apiKey.startsWith('sk-')) {
            apiKeyError = 'Invalid API key format';
            return;
        }

        storageService.saveApiKey(apiKey);
        appStore.setApiKey(apiKey);
        llmService.initialize(apiKey);
        showApiKeyModal = false;
        apiKeyError = null;
    }

    function removeApiKey() {
        storageService.removeApiKey();
        appStore.setApiKey(null);
        apiKey = '';
        showApiKeyModal = false;
    }

    async function handleGenerate(prompt: string) {
        const validation = validatePrompt(prompt);
        if (!validation.isValid) {
            appStore.setError(validation.error || 'Invalid prompt');
            return;
        }

        if (!llmService.isInitialized()) {
            appStore.setError('Please set your API key first');
            showApiKeyModal = true;
            return;
        }

        appStore.setError(null);
        appStore.setGenerating(true);

        try {
            const currentPage = historyStore.getCurrentPage();
            const finalPrompt = conversationMode && currentPage
                ? generateIterationPrompt(currentPage.prompt, prompt, currentPage.code)
                : prompt;

            const code = await llmService.generateSvelteComponent(
                finalPrompt,
                $appStore.conversation,
                conversationMode ? currentPage?.code : undefined
            );

            const newPage: GeneratedPage = {
                id: `page-${Date.now()}`,
                code,
                prompt: conversationMode && currentPage ? `${currentPage.prompt} → ${prompt}` : prompt,
                timestamp: Date.now(),
                messages: [
                    ...$appStore.conversation,
                    {id: `msg-${Date.now()}`, role: 'user', content: prompt, timestamp: Date.now()},
                    {id: `msg-${Date.now() + 1}`, role: 'assistant', content: code, timestamp: Date.now()}
                ]
            };

            historyStore.push(newPage);
            appStore.setCurrentPage(newPage);
            appStore.addMessage({
                id: `msg-${Date.now()}`,
                role: 'user',
                content: prompt,
                timestamp: Date.now()
            });

            await storageService.savePage(newPage);
            conversationMode = true;

        } catch (error: any) {
            appStore.setError(error.message || 'Failed to generate component');
        } finally {
            appStore.setGenerating(false);
        }
    }

    function handleUndo() {
        const previousPage = historyStore.undo();
        if (previousPage) {
            appStore.setCurrentPage(previousPage);
            appStore.loadConversation(previousPage.messages);
        }
    }

    function handleRedo() {
        const nextPage = historyStore.redo();
        if (nextPage) {
            appStore.setCurrentPage(nextPage);
            appStore.loadConversation(nextPage.messages);
        }
    }

    function handleNewComponent() {
        appStore.reset();
        conversationMode = false;
        showConversation = false;
    }


    // Keyboard shortcuts
    function handleKeydown(e: KeyboardEvent) {
        if (e.ctrlKey || e.metaKey) {
            if (e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                handleUndo();
            } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
                e.preventDefault();
                handleRedo();
            }
        }
    }
</script>

<svelte:window on:keydown={handleKeydown}/>

<div class="app">
    <header class="header">
        <div class="header-content">
            <div class="brand">
                <svg class="logo" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <path d="M8 12h8M12 8v8"/>
                </svg>
                <h1>Lovable</h1>
            </div>

            <nav class="toolbar">
                <button
                        class="tool-btn"
                        on:click={handleNewComponent}
                        title="New Component (Ctrl+N)"
                        disabled={$appStore.isGenerating}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M12 5v14M5 12h14"/>
                    </svg>
                    New
                </button>

                <div class="separator"/>

                <button
                        class="tool-btn"
                        on:click={handleUndo}
                        disabled={!$canUndo || $appStore.isGenerating}
                        title="Undo (Ctrl+Z)"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M3 7v6h6"/>
                        <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13"/>
                    </svg>
                    Undo
                </button>

                <button
                        class="tool-btn"
                        on:click={handleRedo}
                        disabled={!$canRedo || $appStore.isGenerating}
                        title="Redo (Ctrl+Shift+Z)"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M21 7v6h-6"/>
                        <path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7"/>
                    </svg>
                    Redo
                </button>

                <div class="separator"/>

                <button
                        class="tool-btn"
                        on:click={() => showConversation = !showConversation}
                        class:active={showConversation}
                        title="Conversation History"
                        disabled={$appStore.conversation.length === 0}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                    </svg>
                    History
                </button>

                <div class="separator"/>

                <button
                        class="tool-btn api-btn"
                        on:click={() => showApiKeyModal = true}
                        class:configured={$hasApiKey}
                        title="API Settings"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        {#if $hasApiKey}
                            <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
                        {:else}
                            <rect x="3" y="11" width="18" height="10" rx="2"/>
                            <path d="M7 11V7a5 5 0 0110 0v4"/>
                        {/if}
                    </svg>
                    API Key
                </button>
            </nav>
        </div>
    </header>

    <main class="main">
        <div class="workspace">
            {#if !$hasApiKey}
                <div class="welcome">
                    <svg class="welcome-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <path d="M8 12h8M12 8v8"/>
                    </svg>
                    <h2>Welcome to Lovable</h2>
                    <p>Transform natural language into production-ready Svelte components</p>
                    <button class="primary-btn" on:click={() => showApiKeyModal = true}>
                        Configure OpenAI API Key
                    </button>
                </div>
            {:else}
                <div class="generator">
                    <PromptInput
                            onSubmit={handleGenerate}
                            {conversationMode}
                    />

                    {#if conversationMode}
                        <div class="mode-badge">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                                <line x1="16" y1="13" x2="8" y2="13"/>
                                <line x1="16" y1="17" x2="8" y2="17"/>
                                <polyline points="10 9 9 9 8 9"/>
                            </svg>
                            Iteration Mode - Your changes will refine the current component
                        </div>
                    {/if}

                    {#if $appStore.error}
                        <div class="error-alert">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="12" y1="8" x2="12" y2="12"/>
                                <line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                            <span>{$appStore.error}</span>
                            <button on:click={() => appStore.setError(null)}>×</button>
                        </div>
                    {/if}

                    {#if $appStore.currentPage}
                        <div class="output">
                            <div class="output-header">
                                <h3>Generated Component</h3>
                                <span class="timestamp">
                  {new Date($appStore.currentPage.timestamp).toLocaleString()}
                </span>
                            </div>
                            <CodeViewer
                                    code={$appStore.currentPage.code}
                                    language="svelte"
                            />
                            <div class="output-footer">
                <span class="prompt-display">
                  Prompt: {$appStore.currentPage.prompt}
                </span>
                            </div>
                        </div>
                    {:else if !$appStore.isGenerating}
                        <div class="empty-state">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <rect x="3" y="3" width="7" height="7"/>
                                <rect x="14" y="3" width="7" height="7"/>
                                <rect x="14" y="14" width="7" height="7"/>
                                <rect x="3" y="14" width="7" height="7"/>
                            </svg>
                            <p>Enter a prompt to generate your first Svelte component</p>
                        </div>
                    {/if}
                </div>
            {/if}
        </div>
    </main>

    <ConversationPanel
            messages={$appStore.conversation}
            isOpen={showConversation}
            on:close={() => showConversation = false}
    />

    <ApiKeyModal
            bind:isOpen={showApiKeyModal}
            bind:apiKey
            bind:showKey
            error={apiKeyError}
            {saveApiKey}
            {removeApiKey}
    />
</div>

<style>
    :global(:root) {
        --radius: 8px;
        --shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    :global(body) {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
        background: var(--background);
        color: var(--text);
    }

    :global(*) {
        box-sizing: border-box;
    }

    .app {
        display: flex;
        flex-direction: column;
        height: 100vh;
    }

    .header {
        background: var(--surface);
        border-bottom: 1px solid var(--border);
        box-shadow: var(--shadow);
    }

    .header-content {
        max-width: 1400px;
        margin: 0 auto;
        padding: 1rem 2rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .brand {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    .logo {
        width: 32px;
        height: 32px;
        color: var(--primary);
    }

    .brand h1 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 600;
    }

    .tagline {
        color: var(--text-secondary);
        font-size: 0.875rem;
        margin-left: 1rem;
        padding-left: 1rem;
        border-left: 1px solid var(--border);
    }

    .toolbar {
        display: flex;
        gap: 0.5rem;
        align-items: center;
    }

    .separator {
        width: 1px;
        height: 24px;
        background: var(--border);
        margin: 0 0.5rem;
    }

    .tool-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.75rem;
        background: var(--background);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        color: var(--text);
        font-size: 0.875rem;
        cursor: pointer;
        transition: all 0.2s;
    }

    .tool-btn svg {
        width: 18px;
        height: 18px;
    }

    .tool-btn:hover:not(:disabled) {
        background: var(--surface);
        transform: translateY(-1px);
        box-shadow: var(--shadow);
    }

    .tool-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }

    .tool-btn.active {
        background: var(--primary);
        color: white;
        border-color: var(--primary);

        &:hover {
            background: var(--primary-hover);
            color: white;
            border-color: var(--primary-hover);
        }

    }

    .api-btn.configured {
        border-color: var(--success);
        color: var(--success);
    }

    .main {
        flex: 1;
        overflow: auto;
    }

    .workspace {
        max-width: 1400px;
        margin: 0 auto;
        padding: 2rem;
    }

    .welcome {
        text-align: center;
        padding: 4rem 2rem;
    }

    .welcome-icon {
        width: 80px;
        height: 80px;
        color: var(--primary);
        margin-bottom: 2rem;
    }

    .welcome h2 {
        font-size: 2rem;
        margin: 0 0 1rem;
    }

    .welcome p {
        color: var(--text-secondary);
        margin-bottom: 2rem;
        font-size: 1.125rem;
    }

    .primary-btn {
        padding: 0.75rem 2rem;
        background: var(--primary);
        color: white;
        border: none;
        border-radius: var(--radius);
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
    }

    .primary-btn:hover {
        background: var(--primary-hover);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(255, 62, 0, 0.3);
    }

    .generator {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .mode-badge {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        color: var(--text-secondary);
        font-size: 0.875rem;
    }

    .mode-badge svg {
        width: 20px;
        height: 20px;
    }

    .error-alert {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
        background: #ffebee;
        border: 1px solid #ffcdd2;
        border-radius: var(--radius);
        color: var(--error);
    }

    .error-alert svg {
        width: 20px;
        height: 20px;
        flex-shrink: 0;
    }

    .error-alert span {
        flex: 1;
    }

    .error-alert button {
        background: none;
        border: none;
        color: var(--error);
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .output {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        overflow: hidden;
    }

    .output-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 1.5rem;
        background: var(--background);
        border-bottom: 1px solid var(--border);
    }

    .output-header h3 {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
    }

    .timestamp {
        font-size: 0.75rem;
        color: var(--text-secondary);
    }

    .output-footer {
        padding: 1rem 1.5rem;
        background: var(--background);
        border-top: 1px solid var(--border);
    }

    .prompt-display {
        font-size: 0.875rem;
        color: var(--text-secondary);
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .empty-state {
        text-align: center;
        padding: 4rem 2rem;
        color: var(--text-secondary);
    }

    .empty-state svg {
        width: 64px;
        height: 64px;
        margin-bottom: 1rem;
        opacity: 0.3;
    }

    @media (max-width: 768px) {
        .header-content {
            flex-direction: column;
            gap: 1rem;
            padding: 1rem;
        }

        .tagline {
            display: none;
        }

        .toolbar {
            width: 100%;
            justify-content: space-between;
            overflow-x: auto;
        }

        .tool-btn span {
            display: none;
        }

        .workspace {
            padding: 1rem;
        }
    }
</style>