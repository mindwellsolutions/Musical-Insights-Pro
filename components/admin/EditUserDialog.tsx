'use client';

/**
 * Edit User Dialog Component
 * Modal for editing existing users
 */

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAdminUserDetail, useUpdateUser } from '@/hooks/admin/useAdminUsers';
import type { UpdateUserData } from '@/types/admin';

interface EditUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSuccess: () => void;
}

export function EditUserDialog({ isOpen, onClose, userId, onSuccess }: EditUserDialogProps) {
  const { data: user, isLoading } = useAdminUserDetail(userId);
  const updateUserMutation = useUpdateUser();

  const [formData, setFormData] = useState<UpdateUserData>({
    email: '',
    user_type: null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        user_type: user.user_type,
      });
    }
  }, [user]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateUserMutation.mutateAsync({ userId, data: formData });
      onSuccess();
      onClose();
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to update user' });
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#ffffff', margin: 0 }}>Edit User</h2>
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

        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#a0a0a0' }}>Loading...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#a0a0a0', marginBottom: '8px' }}>
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>

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
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateUserMutation.isPending}
                style={{
                  padding: '12px 24px',
                  background: updateUserMutation.isPending
                    ? 'rgba(59, 130, 246, 0.5)'
                    : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: updateUserMutation.isPending ? 'not-allowed' : 'pointer',
                }}
              >
                {updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

