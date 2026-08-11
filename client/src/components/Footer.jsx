import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDownIcon } from './icons';

// --- Buy Me a Coffee (temporarily disabled - revisit later) ---
// import { useState } from 'react';
// const MPESA_NUMBER = '+254719644609';

export default function Footer() {
  const [expanded, setExpanded] = useState(false);
  const panelRef = useRef(null);

  // const [showCoffee, setShowCoffee] = useState(false);
  // const [copied, setCopied] = useState(false);

  // const handleCopy = () => {
  //   navigator.clipboard.writeText(MPESA_NUMBER).then(() => {
  //     setCopied(true);
  //     setTimeout(() => setCopied(false), 2000);
  //   });
  // };

  // Scroll the panel into view as soon as it opens, so a single click
  // reveals it immediately instead of leaving it below the fold until the
  // user scrolls down manually.
  useEffect(() => {
    if (expanded && panelRef.current) {
      const id = setTimeout(() => {
        panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 260);
      return () => clearTimeout(id);
    }
  }, [expanded]);

  return (
    <footer className="mt-16 bg-primary-600 text-white">
      {/* Hidden by default - only the brand + toggle chevron show until clicked */}
      <div className="flex items-center justify-between px-4">
        <span className="text-xs font-semibold text-white">Campusmarket</span>
        <button
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
          aria-label={expanded ? 'Hide footer' : 'Show footer'}
          className="flex items-center py-2 px-4 text-white hover:text-primary-100"
        >
          <ChevronDownIcon className={`h-[25px] w-[25px] transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden bg-primary-600 text-white"
          >
            <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-primary-50">
              {/* Left: copyright */}
              <p className="text-center md:text-left whitespace-nowrap">
                &copy; {new Date().getFullYear()} HorizonSolutions Kenya. All rights reserved.
              </p>

              {/* Center: About Us + Contact Us + Terms of Service - each opens in a new tab */}
              <div className="flex items-center gap-4 font-medium">
                <a
                  href="/about"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white"
                >
                  About Us
                </a>
                <span className="text-primary-300">|</span>
                <a
                  href="/contact"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white"
                >
                  Contact Us
                </a>
                <span className="text-primary-300">|</span>
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white"
                >
                  Terms of Service
                </a>
                <span className="text-primary-300">|</span>
                <a
                  href="/suggest-improvement"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white"
                >
                  Suggest Improvement
                </a>
              </div>

              {/* Right: Buy Me a Coffee - commented out for now, revisit later
              <div className="relative">
                <button
                  onClick={() => setShowCoffee((prev) => !prev)}
                  className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold text-sm px-4 py-2 rounded-md whitespace-nowrap"
                >
                  ☕ Buy Me a Coffee
                </button>

                {showCoffee && (
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0 w-64 max-w-[85vw] bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-lg shadow-lg p-4 text-left">
                    <p className="text-gray-700 dark:text-gray-200 mb-2">
                      Enjoyed HomeMarket? Send a coffee via <strong>M-Pesa Send Money</strong> to:
                    </p>
                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-md px-3 py-2">
                      <span className="font-mono font-semibold text-gray-900 dark:text-gray-100">
                        {MPESA_NUMBER}
                      </span>
                      <button
                        onClick={handleCopy}
                        className="ml-auto text-xs bg-primary-600 text-white px-2 py-1 rounded-md hover:bg-primary-700"
                      >
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      On your phone: M-Pesa menu &rarr; Send Money &rarr; enter this number.
                    </p>
                  </div>
                )}
              </div>
              */}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  );
}