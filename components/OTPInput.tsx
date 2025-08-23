'use client';

import React, { useState, useRef, useEffect } from 'react';

interface OTPInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  value?: string;
  disabled?: boolean;
  className?: string;
}

const OTPInput: React.FC<OTPInputProps> = ({ 
  length = 6, 
  onComplete, 
  value = '', 
  disabled = false,
  className = '' 
}) => {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(length).fill(null));

  useEffect(() => {
    if (value) {
      const otpArray = value.split('').slice(0, length);
      const paddedOtp = [...otpArray, ...Array(length - otpArray.length).fill('')];
      setOtp(paddedOtp);
    }
  }, [value, length]);

  const focusNext = (index: number) => {
    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const focusPrev = (index: number) => {
    if (index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only take the last character
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < length - 1) {
      focusNext(index);
    }

    // Call onComplete when all fields are filled
    const otpString = newOtp.join('');
    if (otpString.length === length) {
      onComplete(otpString);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // If current field is empty, focus previous and clear it
        focusPrev(index);
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
      } else {
        // Clear current field
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    } else if (e.key === 'ArrowLeft') {
      focusPrev(index);
    } else if (e.key === 'ArrowRight') {
      focusNext(index);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    const newOtp = [...Array(length)].map((_, i) => pastedData[i] || '');
    setOtp(newOtp);
    
    // Focus the next empty field or the last field
    const nextEmptyIndex = newOtp.findIndex(val => !val);
    const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : length - 1;
    inputRefs.current[focusIndex]?.focus();

    // Call onComplete if all fields are filled
    if (pastedData.length === length) {
      onComplete(pastedData);
    }
  };

  return (
    <div className={`flex gap-3 justify-center w-full ${className}`}>
      {otp.map((digit, index) => (
        <div key={index} className="relative">
          <input
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            disabled={disabled}
            className="w-12 h-12 sm:w-14 sm:h-14 text-center text-lg sm:text-xl font-bold 
                     bg-white border-2 border-gray-300 text-gray-900
                     focus:border-purple-500 focus:ring-4 focus:ring-purple-200 
                     focus:outline-none transition-all duration-300
                     disabled:opacity-50 disabled:cursor-not-allowed
                     rounded-lg shadow-sm hover:shadow-md
                     placeholder:text-gray-400"
            aria-label={`OTP digit ${index + 1}`}
            placeholder="•"
          />
        </div>
      ))}
    </div>
  );
};

export default OTPInput;
