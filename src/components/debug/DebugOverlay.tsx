'use client';

import { useState, useEffect } from 'react';
import { Copy, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function DebugOverlay() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [copiedText, setCopiedText] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [showSpacing, setShowSpacing] = useState(true);

  useEffect(() => {
    if (!isEnabled) {
      setHoveredElement(null);
      setIsPinned(false);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (isPinned) return;
      
      setMousePos({ x: e.clientX, y: e.clientY });
      
      const target = e.target as HTMLElement;
      if (target.closest('#debug-overlay') || target.closest('#debug-info')) return;
      
      setHoveredElement(target);
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'p') {
        setIsPinned(!isPinned);
      }
    };

    document.addEventListener('mousemove', handleMouseMove, true);
    document.addEventListener('keydown', handleKeyPress, true);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove, true);
      document.removeEventListener('keydown', handleKeyPress, true);
    };
  }, [isEnabled, isPinned]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const copyBoth = (element: HTMLElement) => {
    const info = getElementInfo(element);
    const combined = `Classes: ${info.className}\nSelector: ${info.selector}`;
    navigator.clipboard.writeText(combined);
    setCopiedText('both class & selector');
    setTimeout(() => setCopiedText(''), 2000);
  };

  const getElementInfo = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(element);
    
    // Handle className safely - it might be SVGAnimatedString or undefined
    let className = 'none';
    if (element.className) {
      if (typeof element.className === 'string') {
        className = element.className;
      } else if (typeof element.className === 'object' && 'baseVal' in element.className) {
        // SVG elements have className as SVGAnimatedString
        className = (element.className as any).baseVal;
      }
    }
    
    return {
      tagName: element.tagName.toLowerCase(),
      id: element.id || 'none',
      className: className || 'none',
      dimensions: `${Math.round(rect.width)}x${Math.round(rect.height)}`,
      position: `${Math.round(rect.left)}, ${Math.round(rect.top)}`,
      padding: computedStyle.padding,
      margin: computedStyle.margin,
      fontSize: computedStyle.fontSize,
      lineHeight: computedStyle.lineHeight,
      selector: getSelector(element),
    };
  };

  const getSelector = (element: HTMLElement): string => {
    if (element.id) return `#${element.id}`;
    
    let path = [];
    let currentElement: HTMLElement | null = element;
    
    while (currentElement && currentElement.nodeType === Node.ELEMENT_NODE) {
      let selector = currentElement.tagName.toLowerCase();
      
      // Handle className safely
      let classNameStr = '';
      if (currentElement.className) {
        if (typeof currentElement.className === 'string') {
          classNameStr = currentElement.className;
        } else if (typeof currentElement.className === 'object' && 'baseVal' in currentElement.className) {
          // SVG elements
          classNameStr = (currentElement.className as any).baseVal;
        }
      }
      
      if (classNameStr) {
        const classes = classNameStr.split(' ').filter(c => c && !c.includes(':'));
        if (classes.length > 0) {
          selector += '.' + classes.slice(0, 2).join('.');
        }
      }
      
      path.unshift(selector);
      currentElement = currentElement.parentElement;
      
      if (path.length > 3) break;
    }
    
    return path.join(' > ');
  };

  if (!hoveredElement || !isEnabled) {
    return (
      <Button
        id="debug-overlay"
        onClick={() => setIsEnabled(!isEnabled)}
        className={cn(
          "fixed bottom-4 right-4 z-50",
          isEnabled && "bg-red-500 hover:bg-red-600"
        )}
        size="sm"
      >
        {isEnabled ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
        {isEnabled ? 'Disable Debug' : 'Enable Debug'}
      </Button>
    );
  }

  const info = getElementInfo(hoveredElement);

  return (
    <>
      <Button
        id="debug-overlay"
        onClick={() => setIsEnabled(!isEnabled)}
        className="fixed bottom-4 right-4 z-50 bg-red-500 hover:bg-red-600"
        size="sm"
      >
        <EyeOff className="h-4 w-4 mr-2" />
        Disable Debug
      </Button>
      
      <div
        id="debug-info"
        className="fixed z-50 bg-black/90 text-white text-xs p-3 rounded-lg shadow-lg pointer-events-none"
        style={{
          left: Math.min(window.innerWidth - 320, mousePos.x + 20),
          top: Math.max(10, mousePos.y - 100),
          maxWidth: '300px',
        }}
      >
        <div className="space-y-2 pointer-events-auto">
          <div className="font-bold text-sm mb-2 text-yellow-400 flex items-center justify-between">
            Element Inspector
            {isPinned && <span className="text-xs text-green-400">Pinned</span>}
          </div>
          
          <div className="text-xs text-gray-300 mb-2 space-y-1">
            <div>{isPinned ? 'Press P to unpin' : 'Press P to pin inspector'}</div>
            <Button
              size="sm"
              variant="secondary"
              className="h-6 px-2 text-xs w-full"
              onClick={() => copyBoth(hoveredElement)}
            >
              <Copy className="h-3 w-3 mr-1" />
              Copy Both Class & Selector
            </Button>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Tag:</span>
              <span className="font-mono">{info.tagName}</span>
            </div>
            
            <div className="flex justify-between items-start gap-2">
              <span className="text-gray-400">Classes:</span>
              <div className="flex items-center gap-1">
                <span className="font-mono text-xs break-all">{info.className.slice(0, 50)}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-5 w-5 p-0 hover:bg-white/20"
                  onClick={() => copyToClipboard(info.className, 'classes')}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Size:</span>
              <span className="font-mono">{info.dimensions}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Padding:</span>
              <span className="font-mono">{info.padding}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Margin:</span>
              <span className="font-mono">{info.margin}</span>
            </div>
            
            <div className="border-t border-gray-700 pt-2 mt-2">
              <div className="flex justify-between items-start gap-2">
                <span className="text-gray-400">Selector:</span>
                <div className="flex items-center gap-1">
                  <span className="font-mono text-xs break-all">{info.selector}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-5 w-5 p-0 hover:bg-white/20"
                    onClick={() => copyToClipboard(info.selector, 'selector')}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {copiedText && (
            <div className="text-green-400 text-xs mt-2">
              Copied {copiedText}!
            </div>
          )}
        </div>
      </div>
      
      {/* Highlight overlay */}
      <div
        className="fixed pointer-events-none border-2 border-red-500 z-40"
        style={{
          left: hoveredElement.getBoundingClientRect().left - 2,
          top: hoveredElement.getBoundingClientRect().top - 2,
          width: hoveredElement.getBoundingClientRect().width + 4,
          height: hoveredElement.getBoundingClientRect().height + 4,
        }}
      />
      
      {/* Spacing indicators */}
      {showSpacing && hoveredElement.children.length > 0 && (
        <>
          {Array.from(hoveredElement.children).map((child, index) => {
            if (index === 0) return null;
            const prevChild = hoveredElement.children[index - 1];
            const prevRect = prevChild.getBoundingClientRect();
            const currentRect = child.getBoundingClientRect();
            const gap = currentRect.top - prevRect.bottom;
            
            if (gap > 0) {
              return (
                <div
                  key={index}
                  className="fixed pointer-events-none bg-blue-500/30 z-40"
                  style={{
                    left: Math.min(prevRect.left, currentRect.left),
                    top: prevRect.bottom,
                    width: Math.max(prevRect.width, currentRect.width),
                    height: gap,
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-blue-600 text-white text-xs px-1 py-0.5 rounded">
                      {gap.toFixed(1)}px
                    </span>
                  </div>
                </div>
              );
            }
            return null;
          })}
        </>
      )}
    </>
  );
}