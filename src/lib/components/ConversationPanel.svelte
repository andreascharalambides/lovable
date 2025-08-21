<script lang="ts">
  import { appStore } from '../stores/app';
  import type { Message } from '../stores/app';
  
  export let messages: Message[] = [];
  export let isOpen = false;
  
  function formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
  
  function clearConversation() {
    appStore.clearConversation();
  }
</script>

{#if isOpen && messages.length > 0}
  <div class="conversation-panel">
    <div class="panel-header">
      <h3>Conversation History</h3>
      <div class="panel-actions">
        <button 
          class="clear-btn"
          on:click={clearConversation}
          aria-label="Clear conversation"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
        <button 
          class="close-btn"
          on:click={() => isOpen = false}
          aria-label="Close panel"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>
    
    <div class="messages-container">
      {#each messages as message (message.id)}
        <div class="message" class:user={message.role === 'user'}>
          <div class="message-header">
            <span class="role">{message.role === 'user' ? 'You' : 'Assistant'}</span>
            <span class="time">{formatTime(message.timestamp)}</span>
          </div>
          <div class="message-content">
            {message.content}
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}

<style>
  .conversation-panel {
    position: fixed;
    right: 0;
    top: 60px;
    bottom: 0;
    width: 400px;
    background: var(--surface);
    border-left: 1px solid var(--border);
    box-shadow: -4px 0 12px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    z-index: 50;
    animation: slideIn 0.3s ease;
  }
  
  @keyframes slideIn {
    from {
      transform: translateX(100%);
    }
    to {
      transform: translateX(0);
    }
  }
  
  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid var(--border);
  }
  
  .panel-header h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
  }
  
  .panel-actions {
    display: flex;
    gap: 0.5rem;
  }
  
  .clear-btn,
  .close-btn {
    padding: 0.375rem;
    background: transparent;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.2s;
  }
  
  .clear-btn:hover,
  .close-btn:hover {
    background: var(--hover);
    color: var(--text-primary);
  }
  
  .messages-container {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
  }
  
  .message {
    margin-bottom: 1rem;
    padding: 0.75rem;
    background: var(--background);
    border-radius: 8px;
    animation: fadeIn 0.3s ease;
  }
  
  .message.user {
    background: var(--info-bg);
  }
  
  .message-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }
  
  .role {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    color: var(--text-secondary);
  }
  
  .message.user .role {
    color: var(--info-text);
  }
  
  .time {
    font-size: 0.75rem;
    color: var(--text-secondary);
    opacity: 0.7;
  }
  
  .message-content {
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--text-primary);
    white-space: pre-wrap;
    word-break: break-word;
  }
  
  @media (max-width: 768px) {
    .conversation-panel {
      width: 100%;
    }
  }
</style>