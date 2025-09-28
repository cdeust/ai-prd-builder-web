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
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState<string>('');
  const [pendingSectionName, setPendingSectionName] = useState<string>('');
  const [pendingSectionContent, setPendingSectionContent] = useState<string>('');


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

  const createOrUpdateSection = useCallback((sectionTitle: string, content: string) => {
    console.log('[Chat] Creating/updating section:', sectionTitle, 'with', content.length, 'chars');
    console.log('[Chat] Section content preview:', content.substring(0, 500));

    setCurrentPRD(prev => {
      const newSection = PRDSection.create({
        id: crypto.randomUUID(),
        title: sectionTitle,
        content: content,
        order: 0,
      });

      if (!prev) {
        // Create new document with first section
        const newPRD = PRDDocument.create({
          id: crypto.randomUUID(),
          title: 'Product Requirements Document',
          version: '1.0',
          sections: [newSection],
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        console.log('[Chat] Created new PRD with first section:', sectionTitle);
        return newPRD;
      }

      // Check if section exists
      const existingIndex = prev.sections.findIndex(s => s.title === sectionTitle);

      let updatedSections;
      if (existingIndex >= 0) {
        // Update existing section
        const existingSection = prev.sections[existingIndex];
        updatedSections = [...prev.sections];
        updatedSections[existingIndex] = PRDSection.create({
          id: existingSection.id,
          title: existingSection.title,
          content: content,
          order: existingSection.order,
        });
        console.log('[Chat] Updated existing section:', sectionTitle);
      } else {
        // Add new section
        const sectionWithOrder = PRDSection.create({
          id: newSection.id,
          title: newSection.title,
          content: newSection.content,
          order: prev.sections.length,
        });
        updatedSections = [...prev.sections, sectionWithOrder];
        console.log('[Chat] Added new section:', sectionTitle);
      }

      return PRDDocument.create({
        id: prev.id,
        title: prev.title,
        version: prev.version,
        sections: updatedSections,
        createdAt: prev.createdAt,
        updatedAt: new Date(),
      });
    });
  }, []);

  useEffect(() => {
    const handleProgress = (data: any) => {
      console.log('[Chat] Progress message:', data);

      const progressText = data.message || (data.progress !== undefined ? `Progress: ${data.progress}%` : null);

      // Update progress percentage if available
      if (data.progress !== undefined) {
        setGenerationProgress(data.progress);
      }

      // Process section generation messages
      if (data.message) {
        const message = data.message;
        console.log('[Chat] Full message received:', message.substring(0, 100));

        // Check for section generation indicator
        const isGenerating = message.includes('Generating:') || message.includes('🔄');

        if (isGenerating) {
          // New section announced - finalize previous section if exists
          if (pendingSectionName && pendingSectionContent) {
            console.log('[Chat] Finalizing previous section:', pendingSectionName, 'with', pendingSectionContent.length, 'chars');
            createOrUpdateSection(pendingSectionName, pendingSectionContent);
          }

          // Start tracking new section
          // Extract section name and content - completely rewritten for robustness
          let sectionName = '';
          let content = '';

          // Remove the "🔄 Generating:" prefix
          const cleanMessage = message
            .replace(/🔄\s*Generating:\s*/i, '')
            .replace(/^Generating:\s*/i, '');

          console.log('[Chat] Clean message after removing prefix:', cleanMessage.substring(0, 100));

          // Look for markdown code block start
          const codeBlockIndex = cleanMessage.indexOf('```');

          if (codeBlockIndex > 0 && codeBlockIndex < 100) {
            // Section name is everything before the code block
            sectionName = cleanMessage.substring(0, codeBlockIndex).trim();
            content = cleanMessage.substring(codeBlockIndex).trim();
            console.log('[Chat] Extracted via code block split - Section:', sectionName, 'Content starts with:', content.substring(0, 50));
          } else {
            // No code block or it's too far, try other patterns

            // Common section name patterns
            const knownSections = [
              'Task Overview',
              'Feature Changes',
              'Data Model',
              'API Endpoints Overview',
              'User Interface',
              'Testing',
              'Technical Requirements',
              'Acceptance Criteria'
            ];

            // Check if message starts with a known section
            let foundKnownSection = false;
            for (const known of knownSections) {
              // Case-insensitive comparison
              const lowerClean = cleanMessage.toLowerCase();
              const lowerKnown = known.toLowerCase();

              if (lowerClean.startsWith(lowerKnown)) {
                sectionName = known;
                // Get everything after the section name
                content = cleanMessage.substring(known.length).trim();

                // Remove colon if present at the start
                if (content.startsWith(':')) {
                  content = content.substring(1).trim();
                }

                foundKnownSection = true;
                console.log('[Chat] Found known section:', sectionName, 'Content length:', content.length);
                break;
              }
            }

            if (!foundKnownSection) {
              // Try to extract dynamically
              const colonIndex = cleanMessage.indexOf(':');
              const firstNewline = cleanMessage.indexOf('\n');

              if (colonIndex > 0 && colonIndex < 50) {
                // Pattern: "Section Name: content"
                sectionName = cleanMessage.substring(0, colonIndex).trim();
                content = cleanMessage.substring(colonIndex + 1).trim();
              } else if (firstNewline > 0 && firstNewline < 50) {
                // First line might be section name
                const firstLine = cleanMessage.substring(0, firstNewline).trim();
                if (!firstLine.startsWith('#') && !firstLine.startsWith('```') && !firstLine.startsWith('{')) {
                  sectionName = firstLine;
                  content = cleanMessage.substring(firstNewline + 1).trim();
                } else {
                  // First line is content, use whole message
                  sectionName = 'Content Section';
                  content = cleanMessage;
                }
              } else {
                // No clear structure, use whole message
                sectionName = 'Content Section';
                content = cleanMessage;
              }
            }
          }

          // Ensure we always have a section name
          if (!sectionName || sectionName.length === 0) {
            sectionName = 'Content Section';
          }

          if (sectionName) {
            setCurrentSection(sectionName);
            console.log('[Chat] Detected section:', sectionName, 'with content length:', content.length);
            console.log('[Chat] Raw content preview:', content.substring(0, 200));
          }

          // Process different content formats - simplified
          let sectionTitle = sectionName;
          let processedContent = content;

          // Only wrap raw JSON in code blocks, keep everything else as-is
          if (!content.includes('```') && content.trim().startsWith('{') && content.trim().endsWith('}')) {
            // Might be raw JSON, try to format it
            try {
              const parsed = JSON.parse(content);
              processedContent = '```json\n' + JSON.stringify(parsed, null, 2) + '\n```';
              console.log('[Chat] Wrapped raw JSON in code block');
            } catch (e) {
              // Not valid JSON, keep as-is
              processedContent = content;
            }
          } else {
            // Keep content as-is (already has markdown/code blocks or is plain text)
            processedContent = content;
          }

          // Ensure we have some content to show
          if (!processedContent || processedContent.trim().length === 0) {
            processedContent = `*Preparing ${sectionTitle} content...*`;
            console.log('[Chat] No content yet, using placeholder');
          }

          console.log('[Chat] Final processed content length:', processedContent.length);

          // Start new pending section - don't create in PRD yet
          if (sectionName) {
            console.log('[Chat] New section announced:', sectionTitle, 'Starting accumulation...');
            setPendingSectionName(sectionTitle);
            setCurrentSection(sectionTitle);

            // If there's content already in this message (combined announcement + content)
            if (processedContent && processedContent.length > 0 && !processedContent.startsWith('*Preparing')) {
              setPendingSectionContent(processedContent);
              console.log('[Chat] Found immediate content for section:', sectionTitle, '- content:', processedContent.substring(0, 200));
            } else {
              // No immediate content, start with empty
              setPendingSectionContent('');
              console.log('[Chat] Section announced without immediate content:', sectionTitle);
            }
          }
        } else if (pendingSectionName) {
          // Not a section announcement - accumulate ALL content for current section
          // Don't filter - we want everything that comes after the section announcement
          const contentToAdd = message.trim();

          // Skip only truly empty messages or system noise
          if (contentToAdd &&
              !contentToAdd.includes('Response received') &&
              !contentToAdd.includes('SECTION_CONTENT_END') &&
              !contentToAdd.startsWith('  •')) {

            console.log('[Chat] Accumulating content for', pendingSectionName, ':', contentToAdd.substring(0, 100));
            setPendingSectionContent(prev => {
              const newContent = prev ? prev + '\n\n' + contentToAdd : contentToAdd;
              console.log('[Chat] Total accumulated content:', newContent.length, 'chars');
              return newContent;
            });
          }
        }

        // Check for completion
        if (message && (message.includes('✅') || message.includes('complete'))) {
          // Finalize last section if exists
          if (pendingSectionName && pendingSectionContent) {
            console.log('[Chat] Finalizing last section on completion:', pendingSectionName);
            createOrUpdateSection(pendingSectionName, pendingSectionContent);
          }
          setCurrentSection('');
          setPendingSectionName('');
          setPendingSectionContent('');
        }
      }

      if (!progressText) return;

      // Determine if this is technical noise that users don't need to see
      const isTechnicalNoise =
        progressText.includes('Response received') ||
        progressText.includes('SECTION_CONTENT_END') ||
        progressText.startsWith('  •') ||
        (progressText.includes('Found') && progressText.includes('assumptions'));

      // ALWAYS process the message, but only display meaningful ones
      // Also check if the entire message contains content that should trigger preview update
      if (data.message && data.message.includes('```')) {
        // Even if it's "technical noise", if it has markdown/code blocks, it should update the preview
        // The preview update already happened above, so we can skip adding to thinking messages
        if (isTechnicalNoise) return;
      }

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
        // Show questions as clarification message with proper questions array
        setMessages(prev => [...prev, ChatMessage.createClarificationMessage(validQuestions)]);
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

          // Calculate progress based on sections
          const sectionIndex = rawSection.order || 0;
          const estimatedTotalSections = 10; // Estimate total sections
          const sectionProgress = Math.min(((sectionIndex + 1) / estimatedTotalSections) * 100, 90);
          setGenerationProgress(sectionProgress);

          // Update current section name
          if (rawSection.title) {
            setCurrentSection(`Processing ${rawSection.title}...`);
          }

          setCurrentPRD(prev => {
            console.log('[Chat] Current PRD before update:', prev);

            // Create proper PRDSection instance from backend data
            const section = PRDSection.create({
              id: rawSection.id || crypto.randomUUID(),
              title: rawSection.title || 'Untitled Section',
              content: rawSection.content || '',
              order: rawSection.order ?? prev?.sections.length ?? 0,
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

            // Check if this section already exists (by title or order)
            const existingIndex = prev.sections.findIndex(
              s => s.title === section.title || s.order === section.order
            );

            let updatedSections;
            if (existingIndex >= 0) {
              // Update existing section
              updatedSections = [...prev.sections];
              updatedSections[existingIndex] = section;
              console.log('[Chat] Updated existing section at index:', existingIndex);
            } else {
              // Add new section
              updatedSections = [...prev.sections, section];
              console.log('[Chat] Added new section, total sections:', updatedSections.length);
            }

            const updatedDoc = PRDDocument.create({
              id: prev.id,
              title: prev.title,
              version: prev.version,
              sections: updatedSections,
              createdAt: prev.createdAt,
              updatedAt: new Date(),
            });

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

      // Finalize any pending section before marking complete
      if (pendingSectionName && pendingSectionContent) {
        console.log('[Chat] Finalizing pending section in handleGenerationComplete:', pendingSectionName);
        createOrUpdateSection(pendingSectionName, pendingSectionContent);
      }

      setIsGenerating(false);
      setIsConnected(false);
      setGenerationProgress(100);
      setCurrentSection('');
      setPendingSectionName('');
      setPendingSectionContent('');
      setMessages(prev => [...prev, ChatMessage.createAssistantMessage('PRD generation complete!', 'complete')]);
    };

    const handleCompleted = (data: any) => {
      console.log('[Chat] Generation completed:', data);

      // Finalize any pending section
      if (pendingSectionName && pendingSectionContent) {
        console.log('[Chat] Finalizing pending section on completion:', pendingSectionName);
        createOrUpdateSection(pendingSectionName, pendingSectionContent);
      }

      setIsGenerating(false);
      setIsConnected(false);
      setGenerationProgress(100);
      setCurrentSection('');
      setPendingSectionName('');
      setPendingSectionContent('');
      setMessages(prev => [...prev, ChatMessage.createAssistantMessage('PRD generation complete!', 'complete')]);
    };

    const handleError = (data: any) => {
      console.log('[Chat] Error received:', data);
      setIsGenerating(false);
      setIsConnected(false);
      setPendingSectionName('');
      setPendingSectionContent('');
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
  }, [pendingSectionName, pendingSectionContent, createOrUpdateSection]);


  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage = ChatMessage.createUserMessage(content);
    setMessages(prev => [...prev, userMessage]);

    if (!isConnected) {
      setIsGenerating(true);
      setIsConnected(true);
      setGenerationProgress(0);
      setCurrentSection('Initializing...');

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
        setPendingSectionName('');
        setPendingSectionContent('');
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
    generationProgress,
    currentSection,
    sendMessage,
    answerClarification,
  };
}