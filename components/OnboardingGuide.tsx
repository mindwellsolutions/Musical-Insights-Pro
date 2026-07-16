'use client';

/**
 * Onboarding Guide Component
 * Displays an interactive overlay guide to help users understand the app features
 */

import React, { useState, useEffect, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { ThemeConfig } from '@/lib/themes';

interface GuideStep {
  id: string;
  title: string;
  description: string;
  targetSelector: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  highlightPadding?: number;
}

interface OnboardingGuideProps {
  theme: ThemeConfig;
  onClose: () => void;
  onNeverShowAgain: () => void;
  onStepChange?: (stepId: string) => void;
}

const GUIDE_STEPS: GuideStep[] = [
  {
    id: 'app-overview',
    title: 'Welcome to Musical Insights Pro',
    description: 'This app allows musicians to explore scales and modes that are compatible with a given key and scale on an interactive fretboard, build song progressions with multiple key changes, discover compatible scales for improvisation, and use MIDI pedal control for hands-free navigation during performance. Perfect for practice, composition, and live playing!',
    targetSelector: '[data-guide="app-overview"]',
    position: 'bottom',
    highlightPadding: 16,
  },
  {
    id: 'manual-selection',
    title: 'Manual Selection',
    description: 'Select a root note and scale/mode using the colorful note buttons and dropdown. This sets the current key/scale displayed on the fretboard.',
    targetSelector: '[data-guide="manual-selection"]',
    position: 'bottom',
    highlightPadding: 16,
  },
  {
    id: 'add-to-list',
    title: 'Add to Progression',
    description: 'Click "+ Add to Progression" in the top right of the Manual Selection card to save the current key/scale combination to your song progression. Build a sequence of keys to practice or perform.',
    targetSelector: '[data-guide="add-to-list"]',
    position: 'bottom',
    highlightPadding: 12,
  },
  {
    id: 'song-list',
    title: 'Song Progression & Chord Tones',
    description: 'The Song Progression section lets you enable Chord Tones or All Intervals on the fretboard. Toggle chord tones on/off and adjust colors to highlight the 1st, 3rd, 5th and 7th of the current key.',
    targetSelector: '[data-guide="song-list"]',
    position: 'bottom',
    highlightPadding: 12,
  },
  {
    id: 'fretboard',
    title: 'Interactive Fretboard',
    description: 'The fretboard displays the selected scale with color-coded notes. Root notes are highlighted, and you can see chord tones when enabled.',
    targetSelector: '[data-guide="fretboard"]',
    position: 'top',
    highlightPadding: 20,
  },
  {
    id: 'compatible-scales',
    title: 'Compatible Scales & Modes',
    description: 'Explore scales and modes that are compatible with your current key. Click any scale card to load it onto the fretboard. Use left/right arrows to navigate.',
    targetSelector: '[data-guide="compatible-scales"]',
    position: 'top',
    highlightPadding: 16,
  },
  {
    id: 'chord-tones',
    title: 'Chord Tones',
    description: 'Toggle "Chord Tones" to highlight the notes that form the basic chord (1, 3, 5, 7). These are essential notes for outlining harmony.',
    targetSelector: '[data-guide="chord-tones"]',
    position: 'bottom',
    highlightPadding: 12,
  },
  {
    id: 'midi-pedal',
    title: 'MIDI Pedal Setup',
    description: 'Connect a MIDI pedal board to switch between scales hands-free. Configure your pedal in the sidebar settings to navigate your song list during performance.',
    targetSelector: '[data-guide="midi-status"]',
    position: 'left',
    highlightPadding: 12,
  },
];

export default function OnboardingGuide({ theme, onClose, onNeverShowAgain, onStepChange }: OnboardingGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [positionKey, setPositionKey] = useState(0); // Force position recalculation

  const currentGuideStep = GUIDE_STEPS[currentStep];

  // Notify parent when step changes
  useEffect(() => {
    if (onStepChange) {
      onStepChange(currentGuideStep.id);
    }
  }, [currentStep, currentGuideStep.id, onStepChange]);

  // Find and track the target element
  useEffect(() => {
    const findElement = () => {
      const element = document.querySelector(currentGuideStep.targetSelector) as HTMLElement;
      setTargetElement(element);

      if (!element) {
        console.warn(`Guide target not found: ${currentGuideStep.targetSelector}`);
      } else {
        // Force position recalculation when element is found
        setPositionKey(prev => prev + 1);
      }
    };

    findElement();
    // Retry after delays in case elements are still rendering
    // Extended delays for compatible-scales section which loads asynchronously
    const isCompatibleScales = currentGuideStep.id === 'compatible-scales';
    const timer1 = setTimeout(findElement, 100);
    const timer2 = setTimeout(findElement, 300);
    const timer3 = setTimeout(findElement, 500);
    const timer4 = isCompatibleScales ? setTimeout(findElement, 800) : null;
    const timer5 = isCompatibleScales ? setTimeout(findElement, 1200) : null;

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      if (timer4) clearTimeout(timer4);
      if (timer5) clearTimeout(timer5);
    };
  }, [currentStep, currentGuideStep.targetSelector, currentGuideStep.id]);

  // Watch for layout changes and recalculate position
  useEffect(() => {
    if (!targetElement) return;

    const resizeObserver = new ResizeObserver(() => {
      setPositionKey(prev => prev + 1);
    });

    const mutationObserver = new MutationObserver(() => {
      setPositionKey(prev => prev + 1);
    });

    resizeObserver.observe(targetElement);
    mutationObserver.observe(targetElement, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    // Also watch parent containers for layout changes
    let parent = targetElement.parentElement;
    while (parent) {
      resizeObserver.observe(parent);
      parent = parent.parentElement;
      // Only watch up to 3 levels to avoid performance issues
      if (!parent || parent === document.body) break;
    }

    // Add scroll listener to update position on scroll
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setPositionKey(prev => prev + 1);
      }, 50); // Throttle to 50ms
    };

    window.addEventListener('scroll', handleScroll, true); // Use capture phase

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener('scroll', handleScroll, true);
      clearTimeout(scrollTimeout);
    };
  }, [targetElement]);

  // Scroll target element into view with delay for compatible-scales
  useEffect(() => {
    if (targetElement) {
      const isCompatibleScales = currentGuideStep.id === 'compatible-scales';
      const delay = isCompatibleScales ? 600 : 100;

      const timer = setTimeout(() => {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [targetElement, currentGuideStep.id]);

  const handleNext = () => {
    if (currentStep < GUIDE_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    onClose();
  };

  // Calculate position for the guide card
  const getCardPosition = () => {
    if (!targetElement) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    const rect = targetElement.getBoundingClientRect();
    const padding = currentGuideStep.highlightPadding || 12;
    const cardWidth = 360;
    const cardHeight = 280; // Increased approximate height
    const offset = 30; // Distance from target element
    const margin = 20; // Minimum margin from viewport edges

    let position: React.CSSProperties = {};
    let calculatedTop = 0;
    let calculatedLeft = 0;
    let useTransform = true;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    switch (currentGuideStep.position) {
      case 'right':
        calculatedTop = rect.top + rect.height / 2;
        calculatedLeft = rect.right + offset;
        position.transform = 'translateY(-50%)';
        break;
      case 'left':
        calculatedTop = rect.top + rect.height / 2;
        calculatedLeft = rect.left - cardWidth - offset;
        position.transform = 'translateY(-50%)';
        break;
      case 'top':
        calculatedTop = rect.top - cardHeight - offset;
        calculatedLeft = rect.left + rect.width / 2;
        position.transform = 'translateX(-50%)';
        break;
      case 'bottom':
        calculatedTop = rect.bottom + offset;
        calculatedLeft = rect.left + rect.width / 2;
        position.transform = 'translateX(-50%)';
        break;
    }

    // Ensure the card stays within viewport bounds with proper margins
    // Handle horizontal positioning
    if (currentGuideStep.position === 'top' || currentGuideStep.position === 'bottom') {
      // For top/bottom positions, center horizontally but keep within bounds
      const halfCardWidth = cardWidth / 2;
      if (calculatedLeft - halfCardWidth < margin) {
        calculatedLeft = margin + halfCardWidth;
      } else if (calculatedLeft + halfCardWidth > viewportWidth - margin) {
        calculatedLeft = viewportWidth - margin - halfCardWidth;
      }
    } else {
      // For left/right positions
      if (calculatedLeft + cardWidth > viewportWidth - margin) {
        calculatedLeft = viewportWidth - cardWidth - margin;
        useTransform = false;
      } else if (calculatedLeft < margin) {
        calculatedLeft = margin;
        useTransform = false;
      }
    }

    // Handle vertical positioning
    if (currentGuideStep.position === 'left' || currentGuideStep.position === 'right') {
      // For left/right positions, center vertically but keep within bounds
      const halfCardHeight = cardHeight / 2;
      if (calculatedTop - halfCardHeight < margin) {
        calculatedTop = margin + halfCardHeight;
      } else if (calculatedTop + halfCardHeight > viewportHeight - margin) {
        calculatedTop = viewportHeight - margin - halfCardHeight;
      }
    } else {
      // For top/bottom positions
      if (calculatedTop + cardHeight > viewportHeight - margin) {
        calculatedTop = viewportHeight - cardHeight - margin;
        useTransform = false;
      } else if (calculatedTop < margin) {
        calculatedTop = margin;
        useTransform = false;
      }
    }

    position.top = `${calculatedTop}px`;
    position.left = `${calculatedLeft}px`;

    if (!useTransform) {
      position.transform = 'none';
    }

    return position;
  };

  // Memoize card position and recalculate when positionKey changes
  const cardPosition = useMemo(() => {
    return getCardPosition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetElement, currentGuideStep.position, positionKey]);

  return (
    <>
      {/* Minimal backdrop — just enough to catch outside-click; no darkening */}
      <div
        className="fixed inset-0 pointer-events-auto"
        style={{
          zIndex: 9998,
          background: 'rgba(5, 5, 7, 0.10)',
        }}
        onClick={handleClose}
      />

      {/* Highlight box around target element */}
      {targetElement && (() => {
        const rect = targetElement.getBoundingClientRect();
        const padding = currentGuideStep.highlightPadding || 12;
        return (
          <div
            key={positionKey}
            className="fixed pointer-events-none transition-all duration-300"
            style={{
              zIndex: 9999,
              top: `${rect.top - padding}px`,
              left: `${rect.left - padding}px`,
              width: `${rect.width + padding * 2}px`,
              height: `${rect.height + padding * 2}px`,
              border: '2px solid var(--mi-accent-blue)',
              borderRadius: 12,
              boxShadow: '0 0 0 4px var(--mi-accent-blue), 0 0 0 9999px rgba(5,5,7,0.10)',
              animation: 'pulse 2s ease-in-out infinite',
              pointerEvents: 'none',
            }}
          />
        );
      })()}

      {/* Pointer line from card to target */}
      {targetElement && (() => {
        const rect = targetElement.getBoundingClientRect();
        const targetCenterX = rect.left + rect.width / 2;
        const targetCenterY = rect.top + rect.height / 2;

        // Calculate card center based on position
        let cardX = parseFloat(cardPosition.left as string || '0');
        let cardY = parseFloat(cardPosition.top as string || '0');

        // Force recalculation by using positionKey
        const _forceUpdate = positionKey;

        // Adjust for transform
        if (cardPosition.transform?.includes('translateX(-50%)')) {
          // Card is centered horizontally, so use the left value as center
        } else if (cardPosition.transform?.includes('translateY(-50%)')) {
          // Card is centered vertically, so use the top value as center
        }

        // Determine line start point based on card position relative to target
        let lineStartX = cardX;
        let lineStartY = cardY;

        switch (currentGuideStep.position) {
          case 'right':
            lineStartX = cardX; // Left edge of card
            lineStartY = cardY; // Center of card (already adjusted by translateY)
            break;
          case 'left':
            lineStartX = cardX + 360; // Right edge of card
            lineStartY = cardY;
            break;
          case 'top':
            lineStartX = cardX; // Center of card (already adjusted by translateX)
            lineStartY = cardY + 250; // Bottom edge of card
            break;
          case 'bottom':
            lineStartX = cardX; // Center of card
            lineStartY = cardY; // Top edge of card
            break;
        }

        return (
          <svg
            className="fixed pointer-events-none"
            style={{
              zIndex: 10000,
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
            }}
          >
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 10 3, 0 6" fill="#3b82f6" />
              </marker>
            </defs>
            <line
              x1={lineStartX}
              y1={lineStartY}
              x2={targetCenterX}
              y2={targetCenterY}
              stroke="#3b82f6"
              strokeWidth="3"
              markerEnd="url(#arrowhead)"
              strokeDasharray="8,4"
              style={{
                filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))',
              }}
            />
          </svg>
        );
      })()}

      {/* Guide card — glassmorphism */}
      <div
        style={{
          position: 'fixed',
          zIndex: 10001,
          ...cardPosition,
          width: 400,
          maxWidth: 'calc(100vw - 32px)',
          background: 'var(--mi-bg-glass)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid var(--mi-border-strong)',
          borderRadius: 'var(--mi-radius-xl)',
          boxShadow: 'var(--mi-shadow-modal)',
          padding: '24px 28px',
          display: 'flex', flexDirection: 'column', gap: 16,
        }}
      >
        {/* Progress dot stepper */}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
          {GUIDE_STEPS.map((_, index) => (
            <div
              key={index}
              style={{
                width: index === currentStep ? 20 : 7,
                height: 7,
                borderRadius: 'var(--mi-radius-full)',
                background: index === currentStep ? 'var(--mi-accent-blue)' : 'var(--mi-border-medium)',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>

        {/* Title + Close */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--mi-text-primary)', margin: 0, lineHeight: 1.3 }}>
            {currentGuideStep.title}
          </h3>
          <button
            onClick={handleClose}
            style={{ background: 'var(--mi-bg-elevated)', border: '1px solid var(--mi-border-medium)', borderRadius: 8, padding: '4px 6px', cursor: 'pointer', color: 'var(--mi-text-secondary)', flexShrink: 0 }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Description */}
        <p style={{ fontSize: 14, color: 'var(--mi-text-secondary)', lineHeight: 1.6, margin: 0 }}>
          {currentGuideStep.description}
        </p>

        {/* Navigation row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
          <button
            onClick={onNeverShowAgain}
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--mi-text-secondary)',
              background: 'var(--mi-bg-elevated)',
              border: '1px solid var(--mi-border-medium)',
              borderRadius: 8,
              cursor: 'pointer',
              padding: '6px 12px',
              transition: 'background 0.15s, border-color 0.15s, color 0.15s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.12)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239,68,68,0.5)';
              (e.currentTarget as HTMLButtonElement).style.color = '#f87171';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--mi-bg-elevated)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--mi-border-medium)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--mi-text-secondary)';
            }}
            title="Dismiss and never show this guide on startup again (re-enable in Settings)"
          >
            Never show again
          </button>

          <div style={{ display: 'flex', gap: 8 }}>
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 16px', borderRadius: 'var(--mi-radius-md)', background: 'var(--mi-bg-elevated)', border: '1px solid var(--mi-border-medium)', color: 'var(--mi-text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                <ChevronLeft size={14} /> Prev
              </button>
            )}
            <button
              onClick={currentStep === GUIDE_STEPS.length - 1 ? handleClose : handleNext}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 18px', borderRadius: 'var(--mi-radius-md)', background: currentStep === GUIDE_STEPS.length - 1 ? 'linear-gradient(135deg, var(--mi-accent-blue), #2563eb)' : 'var(--mi-bg-elevated)', border: '1px solid var(--mi-border-medium)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              {currentStep === GUIDE_STEPS.length - 1 ? 'Done ✓' : 'Next'}
              {currentStep < GUIDE_STEPS.length - 1 && <ChevronRight size={14} />}
            </button>
          </div>
        </div>
      </div>

      {/* Pulse animation */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3), 0 0 30px rgba(59, 130, 246, 0.5);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.2), 0 0 40px rgba(59, 130, 246, 0.7);
          }
        }
      `}</style>
    </>
  );
}

