'use client';

/**
 * Invite User Dialog Component
 * Modal for inviting new users via email
 */

import React, { useState } from 'react';
import { X, Mail } from 'lucide-react';
import { useInviteUser } from '@/hooks/admin/useAdminUsers';
import type { InviteUserData } from '@/types/admin';

interface InviteUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function InviteUserDialog({ isOpen, onClose, onSuccess }: InviteUserDialogProps) {
  const [formData, setFormData] = useState<InviteUserData>({
    email: '',
    user_type: null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const inviteUserMutation = useInviteUser();

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await inviteUserMutation.mutateAsync(formData);
      onSuccess();
      onClose();
      // Reset form
      setFormData({ email: '', user_type: null });
      setErrors({});
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to invite user' });
    }
  };

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
          maxWidth: '500px',
          width: '90%',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Mail size={20} style={{ color: '#ffffff' }} />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#ffffff', margin: 0 }}>Invite User</h2>
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

        {/* Description */}
        <p style={{ fontSize: '14px', color: '#a0a0a0', marginBottom: '24px', lineHeight: '1.5' }}>
          Send an invitation email to a new user. They will receive a link to set up their password and access the application.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#a0a0a0', marginBottom: '8px' }}>
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="user@example.com"
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${errors.email ? '#ef4444' : 'rgba(255, 255, 255, 0.1)'}`,
                borderRadius: '12px',
                color: '#ffffff',
                fontSize: '14px',
                outline: 'none',
              }}
            />
            {errors.email && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.email}</p>}
          </div>

          {/* Role */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#a0a0a0', marginBottom: '8px' }}>
              Role
            </label>
            <select
              value={formData.user_type || 'user'}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  user_type: e.target.value === 'user' ? null : (e.target.value as 'admin' | 'moderator'),
                })
              }
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                color: '#ffffff',
                fontSize: '14px',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="user" style={{ background: '#1a1a1a', color: '#ffffff' }}>User</option>
              <option value="admin" style={{ background: '#1a1a1a', color: '#ffffff' }}>Admin</option>
              <option value="moderator" style={{ background: '#1a1a1a', color: '#ffffff' }}>Moderator</option>
            </select>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div
              style={{
                padding: '12px 16px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                color: '#ef4444',
                fontSize: '14px',
                marginBottom: '20px',
              }}
            >
              {errors.submit}
            </div>
          )}

          {/* Success Message */}
          {inviteUserMutation.isSuccess && (
            <div
              style={{
                padding: '12px 16px',
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '8px',
                color: '#22c55e',
                fontSize: '14px',
                marginBottom: '20px',
              }}
            >
              Invitation sent successfully!
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
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
                transition: 'all 200ms ease-in-out',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={inviteUserMutation.isPending}
              style={{
                padding: '12px 24px',
                background: inviteUserMutation.isPending
                  ? 'rgba(59, 130, 246, 0.5)'
                  : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                border: 'none',
                borderRadius: '12px',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: inviteUserMutation.isPending ? 'not-allowed' : 'pointer',
                transition: 'all 200ms ease-in-out',
              }}
            >
              {inviteUserMutation.isPending ? 'Sending...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

