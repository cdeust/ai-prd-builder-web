import { useState, useCallback, useEffect, useRef } from 'react';
import { ChatMessage } from '../../domain/valueObjects/ChatMessage.ts';
import { PRDDocument } from '../../domain/entities/PRDDocument.ts';
import { PRDSection } from '../../domain/entities/PRDSection.ts';
import { DIContainer } from '../../shared/DIContainer.ts';

export function useChatConversation() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPRD, setCurrentPRD] = useState<PRDDocument | null>(null);
  const [pendingClarification, setPendingClarification] = useState<string[] | null>(null);


  const container = DIContainer.getInstance();
  const wsClient = container.getWebSocketClient();

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const updateLastMessage = useCallback((content: string) => {
    setMessages(prev => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      return [...prev.slice(0, -1), last.withContent(content)];
    });
  }, []);

  useEffect(() => {
    const handleProgress = (data: any) => {
      console.log('[Chat] Progress message:', data);

      const progressText = data.message || (data.progress !== undefined ? `Progress: ${data.progress}%` : null);

      if (!progressText) return;

      // Determine if this is technical noise that users don't need to see
      const isTechnicalNoise =
        progressText.includes('Response received') ||
        progressText.includes('SECTION_CONTENT_END') ||
        progressText.startsWith('  •') ||
        (progressText.includes('Found') && progressText.includes('assumptions'));

      // ALWAYS process the message, but only display meaningful ones
      if (!isTechnicalNoise) {
        setMessages(prev => {
          // Find the LAST thinking message in the entire array (not just the last message)
          let lastThinkingIndex = -1;
          for (let i = prev.length - 1; i >= 0; i--) {
            if (prev[i].type === 'thinking') {
              lastThinkingIndex = i;
              break;
            }
          }

          if (lastThinkingIndex >= 0) {
            // Update the last thinking message
            const thinkingMsg = prev[lastThinkingIndex];
            const updatedContent = thinkingMsg.content.includes(progressText)
              ? thinkingMsg.content
              : `${thinkingMsg.content}\n${progressText}`;

            const newMessages = [...prev];
            newMessages[lastThinkingIndex] = thinkingMsg.withContent(updatedContent);
            return newMessages;
          }

          // Add new thinking message if none exists
          return [...prev, ChatMessage.createThinkingMessage(progressText)];
        });
      }
      // If it's technical noise, we still handled the message, just didn't update UI
    };

    const handleClarification = (data: any) => {
      console.log('[Chat] Clarification needed:', data);

      setIsGenerating(false);

      const questions = data.questions || [];

      // Filter out ONLY empty or meaningless placeholder questions
      const validQuestions = questions.filter((q: string) => {
        const trimmed = q.trim();
        // Only filter out completely empty or the generic "Your answer" placeholder
        return trimmed.length > 0 && trimmed.toLowerCase() !== 'your answer';
      });

      if (validQuestions.length > 0) {
        // Show questions as assistant message
        const questionText = validQuestions.map((q: string, i: number) => `${i + 1}. ${q}`).join('\n\n');
        setMessages(prev => [...prev, ChatMessage.createAssistantMessage(
          `I need clarification on the following:\n\n${questionText}`,
          'clarification'
        )]);
        setPendingClarification(validQuestions);
      } else {
        // All questions were invalid/placeholders - auto-continue by sending empty answer
        console.log('[Chat] All questions were invalid, auto-continuing...');
        setIsGenerating(true);
        wsClient.send('clarification_answers', { answers: ['continue'] });
      }
    };

    const handleSection = (data: any) => {
      console.log('[Chat] Section received:', data);
      console.log('[Chat] Raw section data:', JSON.stringify(data.section, null, 2));

      try {
        if (data.section) {
          const rawSection = data.section;

          setCurrentPRD(prev => {
            console.log('[Chat] Current PRD before update:', prev);

            // Calculate order based on current sections
            const order = rawSection.order ?? prev?.sections.length ?? 0;

            // Create proper PRDSection instance from backend data
            const section = PRDSection.create({
              id: rawSection.id || crypto.randomUUID(),
              title: rawSection.title || 'Untitled Section',
              content: rawSection.content || '',
              order,
            });

            console.log('[Chat] Created PRDSection with title:', section.title, 'content length:', section.content.length);

            if (!prev) {
              const documentTitle = data.title || 'Product Requirements Document';
              const newDoc = PRDDocument.create({
                id: data.requestId || data.request_id || crypto.randomUUID(),
                title: documentTitle,
                version: '1.0',
                sections: [section],
                createdAt: new Date(),
                updatedAt: new Date(),
              });
              console.log('[Chat] Created new PRD document:', newDoc.title, 'with', newDoc.sections.length, 'section(s)');
              return newDoc;
            }

            const updatedSections = [...prev.sections, section];
            const updatedDoc = PRDDocument.create({
              id: prev.id,
              title: prev.title,
              version: prev.version,
              sections: updatedSections,
              createdAt: prev.createdAt,
              updatedAt: new Date(),
            });
            console.log('[Chat] Updated PRD document, now has', updatedDoc.sections.length, 'section(s)');
            return updatedDoc;
          });
        }
      } catch (error) {
        console.error('[Chat] Error processing section:', error);
        console.error('[Chat] Section data was:', data);
      }
    };

    const handleGenerationComplete = (data: any) => {
      console.log('[Chat] Generation complete with full PRD:', data);

      try {
        if (data.result && data.result.sections) {
          const result = data.result;

          setCurrentPRD(prev => {
            // If we already have sections from incremental updates, merge with the complete result
            // This ensures we keep the full detailed content from the final result
            const completeSections = result.sections.map((rawSection: any, index: number) =>
              PRDSection.create({
                id: rawSection.id || crypto.randomUUID(),
                title: rawSection.title || 'Untitled Section',
                content: rawSection.content || '',
                order: rawSection.order ?? index,
              })
            );

            const completePRD = PRDDocument.create({
              id: result.id || data.requestId || data.request_id || prev?.id || crypto.randomUUID(),
              title: result.title || prev?.title || 'Generated PRD',
              version: result.version?.toString() || '1.0',
              sections: completeSections,
              createdAt: prev?.createdAt || new Date(),
              updatedAt: new Date(),
            });

            console.log('[Chat] Updated PRD with complete data:', completeSections.length, 'sections');
            return completePRD;
          });
        }
      } catch (error) {
        console.error('[Chat] Error processing complete PRD:', error);
      }

      setIsGenerating(false);
      setIsConnected(false);
      setMessages(prev => [...prev, ChatMessage.createAssistantMessage('PRD generation complete!', 'complete')]);
    };

    const handleCompleted = (data: any) => {
      console.log('[Chat] Generation completed:', data);
      setIsGenerating(false);
      setIsConnected(false);
      setMessages(prev => [...prev, ChatMessage.createAssistantMessage('PRD generation complete!', 'complete')]);
    };

    const handleError = (data: any) => {
      console.log('[Chat] Error received:', data);
      setIsGenerating(false);
      setIsConnected(false);
      setMessages(prev => [...prev, ChatMessage.createAssistantMessage(data.message || 'An error occurred during generation.', 'error')]);
    };

    // Clear any existing handlers first
    wsClient.clearHandlers();

    wsClient.onMessage('progress', handleProgress);
    wsClient.onMessage('clarification_needed', handleClarification);
    wsClient.onMessage('section', handleSection);
    wsClient.onMessage('generation_complete', handleGenerationComplete);
    wsClient.onMessage('completed', handleCompleted);
    wsClient.onMessage('error', handleError);

    return () => {
      wsClient.clearHandlers();
    };
  }, []);


  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage = ChatMessage.createUserMessage(content);
    setMessages(prev => [...prev, userMessage]);

    if (!isConnected) {
      setIsGenerating(true);
      setIsConnected(true);

      try {
        // Generate a temporary request ID for WebSocket connection
        const tempRequestId = crypto.randomUUID();

        const wsClient = container.getWebSocketClient();
        await wsClient.connect(tempRequestId);

        wsClient.send('start_generation', {
          title: 'PRD Request',
          description: content,
          priority: 'medium'
        });

        // Create or update thinking message
        setMessages(prev => {
          const lastThinkingIndex = prev.findIndex(m => m.type === 'thinking');
          if (lastThinkingIndex >= 0) {
            const updated = [...prev];
            updated[lastThinkingIndex] = prev[lastThinkingIndex].withContent('Starting PRD generation...');
            return updated;
          }
          return [...prev, ChatMessage.createThinkingMessage('Starting PRD generation...')];
        });
      } catch (error) {
        setIsGenerating(false);
        setIsConnected(false);
        console.error('[Chat] Failed to start generation:', error);
        setMessages(prev => [...prev, ChatMessage.createAssistantMessage(
          'Failed to start PRD generation.',
          'error'
        )]);
      }
    }
  }, [isConnected, container]);

  const answerClarification = useCallback(async (answerText: string) => {
    if (!isConnected || !pendingClarification) return;

    const answerMessage = ChatMessage.createUserMessage(answerText);
    setMessages(prev => [...prev, answerMessage]);

    setIsGenerating(true);

    // Split by newlines to get array of answers
    const answers = answerText.split('\n').map(a => a.trim()).filter(a => a.length > 0);

    wsClient.send('clarification_answers', { answers });
    setPendingClarification(null);

    // Create or update thinking message
    setMessages(prev => {
      const lastThinkingIndex = prev.findIndex(m => m.type === 'thinking');
      if (lastThinkingIndex >= 0) {
        const updated = [...prev];
        updated[lastThinkingIndex] = prev[lastThinkingIndex].withContent('Processing your answers...');
        return updated;
      }
      return [...prev, ChatMessage.createThinkingMessage('Processing your answers...')];
    });
  }, [isConnected, pendingClarification, wsClient]);

  useEffect(() => {
    return () => {
      wsClient.disconnect();
    };
  }, [wsClient]);

  return {
    messages,
    isConnected,
    isGenerating,
    currentPRD,
    pendingClarification,
    sendMessage,
    answerClarification,
  };
}