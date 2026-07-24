import React from 'react';

// --- Buy Me a Coffee (temporarily disabled - revisit later) ---
// import { useState } from 'react';
// const MPESA_NUMBER = '+254719644609';

export default function Footer() {
  // const [showCoffee, setShowCoffee] = useState(false);
  // const [copied, setCopied] = useState(false);

  // const handleCopy = () => {
  //   navigator.clipboard.writeText(MPESA_NUMBER).then(() => {
  //     setCopied(true);
  //     setTimeout(() => setCopied(false), 2000);
  //   });
  // };

  return (
    <footer className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-400">



     {/* Left: copyright + location */}
<div className="text-center md:text-left">
  <p className="whitespace-nowrap">
    &copy; {new Date().getFullYear()} HorizonSolutions Kenya. All rights reserved.
  </p>

  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
    📍 Nyandarua, Olkalou, Kenya
  </p>
</div>

        {/* Center: Contact Us + Terms of Service - each opens in a new tab */}
        <div className="flex items-center gap-4 font-medium">
          <a
            href="/contact"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary-600 dark:hover:text-primary-300"
          >
            Contact Us
          </a>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <a
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary-600 dark:hover:text-primary-300"
          >
            Terms of Service
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
    </footer>
  );
}