export const PROMPT_TEMPLATES = {
  landing: 'Create a modern landing page with a hero section, features grid, and call-to-action',
  dashboard: 'Build a dashboard with stats cards, charts, and a data table',
  form: 'Design a multi-step form with validation and progress indicator',
  gallery: 'Create an image gallery with lightbox and filtering',
  blog: 'Build a blog post layout with comments section',
  pricing: 'Design a pricing table with feature comparison',
  profile: 'Create a user profile page with editable fields',
  chat: 'Build a chat interface with message bubbles and input',
  calendar: 'Design a calendar component with event management',
  kanban: 'Create a kanban board with drag and drop'
};

export const ENHANCEMENT_PROMPTS = {
  responsive: 'Make this component fully responsive for mobile, tablet, and desktop',
  animated: 'Add smooth animations and transitions to improve user experience',
  accessible: 'Improve accessibility with ARIA labels, keyboard navigation, and screen reader support',
  interactive: 'Add more interactive elements and user feedback',
  styled: 'Enhance the visual design with modern styling and better typography',
  optimized: 'Optimize performance with lazy loading and efficient rendering',
  darkMode: 'Add dark mode support with a toggle switch',
  i18n: 'Add internationalization support with language switching'
};

export function enhancePrompt(basePrompt: string, enhancements: string[] = []): string {
  let enhanced = basePrompt;
  
  // Add default requirements if not specified
  if (!basePrompt.toLowerCase().includes('responsive')) {
    enhanced += '\n- Make it responsive for all screen sizes';
  }
  
  if (!basePrompt.toLowerCase().includes('style') && !basePrompt.toLowerCase().includes('design')) {
    enhanced += '\n- Use modern, clean design with good typography';
  }
  
  if (!basePrompt.toLowerCase().includes('interactive')) {
    enhanced += '\n- Include appropriate interactive elements';
  }
  
  // Add selected enhancements
  enhancements.forEach(enhancement => {
    if (ENHANCEMENT_PROMPTS[enhancement as keyof typeof ENHANCEMENT_PROMPTS]) {
      enhanced += `\n- ${ENHANCEMENT_PROMPTS[enhancement as keyof typeof ENHANCEMENT_PROMPTS]}`;
    }
  });
  
  return enhanced;
}

export function generateIterationPrompt(
  originalPrompt: string,
  feedback: string,
  currentCode: string
): string {
  return `Original request: ${originalPrompt}

User feedback: ${feedback}

Please update the component based on the feedback while maintaining all existing functionality.
Focus on the specific changes requested.`;
}

export function validatePrompt(prompt: string): {
  isValid: boolean;
  error?: string;
} {
  if (!prompt || prompt.trim().length === 0) {
    return { isValid: false, error: 'Prompt cannot be empty' };
  }
  
  if (prompt.length < 10) {
    return { isValid: false, error: 'Please provide more details (at least 10 characters)' };
  }
  
  if (prompt.length > 1000) {
    return { isValid: false, error: 'Prompt is too long (maximum 1000 characters)' };
  }
  
  // Check for potential security issues
  const dangerousPatterns = [
    /<script[\s\S]*?<\/script>/gi,
    /eval\s*\(/gi,
    /new\s+Function/gi,
    /document\.write/gi
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(prompt)) {
      return { isValid: false, error: 'Prompt contains potentially unsafe content' };
    }
  }
  
  return { isValid: true };
}