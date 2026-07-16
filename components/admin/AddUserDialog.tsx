'use client';

/**
 * Add User Dialog Component
 * Modal for creating new users
 */

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useCreateUser } from '@/hooks/admin/useAdminUsers';
import type { CreateUserData } from '@/types/admin';

interface AddUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddUserDialog({ isOpen, onClose, onSuccess }: AddUserDialogProps) {
  const [formData, setFormData] = useState<CreateUserData>({
    email: '',
    password: '',
    user_type: null,
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createUserMutation = useCreateUser();

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await createUserMutation.mutateAsync(formData);
      onSuccess();
      onClose();
      // Reset form
      setFormData({ email: '', password: '', user_type: null });
      setConfirmPassword('');
      setErrors({});
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to create user' });
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
          <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#ffffff', margin: 0 }}>Add New User</h2>
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

          {/* Password */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#a0a0a0', marginBottom: '8px' }}>
              Password *
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${errors.password ? '#ef4444' : 'rgba(255, 255, 255, 0.1)'}`,
                borderRadius: '12px',
                color: '#ffffff',
                fontSize: '14px',
                outline: 'none',
              }}
            />
            {errors.password && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#a0a0a0', marginBottom: '8px' }}>
              Confirm Password *
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${errors.confirmPassword ? '#ef4444' : 'rgba(255, 255, 255, 0.1)'}`,
                borderRadius: '12px',
                color: '#ffffff',
                fontSize: '14px',
                outline: 'none',
              }}
            />
            {errors.confirmPassword && (
              <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.confirmPassword}</p>
            )}
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
              disabled={createUserMutation.isPending}
              style={{
                padding: '12px 24px',
                background: createUserMutation.isPending
                  ? 'rgba(59, 130, 246, 0.5)'
                  : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                border: 'none',
                borderRadius: '12px',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: createUserMutation.isPending ? 'not-allowed' : 'pointer',
                transition: 'all 200ms ease-in-out',
              }}
            >
              {createUserMutation.isPending ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

