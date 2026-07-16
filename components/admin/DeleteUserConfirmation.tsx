'use client';

/**
 * Delete User Confirmation Dialog
 * Confirmation modal for user deletion
 */

import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface DeleteUserConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  user: { id: string; email: string } | null;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function DeleteUserConfirmation({
  isOpen,
  onClose,
  user,
  onConfirm,
  isDeleting,
}: DeleteUserConfirmationProps) {
  const [confirmed, setConfirmed] = useState(false);

  if (!isOpen || !user) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#1a1a1a',
          borderRadius: '20px',
          padding: '32px',
          maxWidth: '400px',
          width: '90%',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle size={20} style={{ color: '#ef4444' }} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#ffffff', margin: 0 }}>Delete User</h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#a0a0a0',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={24} />
          </button>
        </div>

        <p style={{ fontSize: '14px', color: '#a0a0a0', marginBottom: '16px', lineHeight: 1.6 }}>
          Are you sure you want to delete the user{' '}
          <strong style={{ color: '#ffffff' }}>{user.email}</strong>?
        </p>

        <p style={{ fontSize: '14px', color: '#ef4444', marginBottom: '24px', lineHeight: 1.6 }}>
          This action cannot be undone. All user data will be permanently deleted.
        </p>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            style={{
              width: '20px',
              height: '20px',
              cursor: 'pointer',
            }}
          />
          <span style={{ fontSize: '14px', color: '#a0a0a0' }}>
            I understand this action cannot be undone
          </span>
        </label>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 24px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              color: '#a0a0a0',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!confirmed || isDeleting}
            style={{
              padding: '12px 24px',
              background: !confirmed || isDeleting ? 'rgba(239, 68, 68, 0.3)' : '#ef4444',
              border: 'none',
              borderRadius: '12px',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 600,
              cursor: !confirmed || isDeleting ? 'not-allowed' : 'pointer',
              opacity: !confirmed || isDeleting ? 0.5 : 1,
            }}
          >
            {isDeleting ? 'Deleting...' : 'Delete User'}
          </button>
        </div>
      </div>
    </div>
  );
}

