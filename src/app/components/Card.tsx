'use client';

import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  className?: string;
  headerAction?: ReactNode;
  footer?: ReactNode;
  isHoverable?: boolean;
  onClick?: () => void;
  padding?: 'none' | 'small' | 'normal' | 'large';
  variant?: 'default' | 'outlined' | 'elevated';
  noDivider?: boolean;
}

export default function Card({
  children,
  title,
  subtitle,
  icon,
  className = '',
  headerAction,
  footer,
  isHoverable = false,
  onClick,
  padding = 'normal',
  variant = 'default',
  noDivider = false
}: CardProps) {
  // Determine padding class
  const paddingClasses = {
    none: 'p-0',
    small: 'p-3',
    normal: 'p-6',
    large: 'p-8'
  };
  
  // Determine content padding
  const contentPadding = padding !== 'none' ? paddingClasses[padding] : 'p-0';
  
  // Determine variant classes
  const variantClasses = {
    default: 'bg-white border border-gray-100 shadow-sm',
    outlined: 'bg-white border border-gray-200 shadow-none',
    elevated: 'bg-white border-none shadow-md'
  };

  return (
    <div 
      className={`rounded-lg overflow-hidden transition-all ${
        variantClasses[variant]
      } ${
        isHoverable ? 'hover:shadow-lg hover:-translate-y-1 transition-all duration-200' : ''
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {(title || subtitle || icon || headerAction) && (
        <div className={`px-6 py-4 ${!noDivider ? 'border-b border-gray-100' : ''} flex items-center justify-between`}>
          <div className="flex items-center space-x-3">
            {icon && (
              <div className="text-primary-500 flex items-center justify-center">
                {icon}
              </div>
            )}
            <div>
              {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
              {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      
      <div className={contentPadding}>{children}</div>
      
      {footer && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
          {footer}
        </div>
      )}
    </div>
  );
} 