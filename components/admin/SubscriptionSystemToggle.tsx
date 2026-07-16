'use client';

/**
 * Subscription System Toggle Component
 * Allows admins to enable/disable the subscription system globally
 */

import React, { useState, useEffect } from 'react';
import { Power, Loader2 } from 'lucide-react';

export function SubscriptionSystemToggle() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch current setting on mount
  useEffect(() => {
    fetchSetting();
  }, []);

  async function fetchSetting() {
    try {
      const response = await fetch('/api/admin/system-settings?key=subscription_system');
      if (!response.ok) throw new Error('Failed to fetch setting');
      
      const data = await response.json();
      setIsEnabled(data.settings?.setting_value?.enabled ?? true);
    } catch (error) {
      console.error('Error fetching subscription system setting:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleToggle() {
    setIsUpdating(true);
    try {
      const response = await fetch('/api/admin/system-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          setting_key: 'subscription_system',
          setting_value: { enabled: !isEnabled },
        }),
      });

      if (!response.ok) throw new Error('Failed to update setting');

      setIsEnabled(!isEnabled);
    } catch (error) {
      console.error('Error updating subscription system setting:', error);
      alert('Failed to update subscription system setting');
    } finally {
      setIsUpdating(false);
    }
  }

  if (isLoading) {
    return (
      <div
        style={{
          background: 'rgba(30, 30, 46, 0.6)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '32px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Loader2 size={20} style={{ color: '#a0a0a0', animation: 'spin 1s linear infinite' }} />
          <span style={{ color: '#a0a0a0' }}>Loading system settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'rgba(30, 30, 46, 0.6)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '32px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Power size={24} style={{ color: isEnabled ? '#10b981' : '#ef4444' }} />
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#ffffff', margin: 0 }}>
              Subscription System
            </h2>
          </div>
          <p style={{ fontSize: '14px', color: '#a0a0a0', margin: 0 }}>
            {isEnabled
              ? 'Subscription checks are active. Users need an active subscription to access the app.'
              : 'Subscription checks are disabled. All users can access the app without a subscription.'}
          </p>
        </div>

        <button
          onClick={handleToggle}
          disabled={isUpdating}
          style={{
            position: 'relative',
            width: '64px',
            height: '32px',
            borderRadius: '16px',
            border: 'none',
            cursor: isUpdating ? 'not-allowed' : 'pointer',
            background: isEnabled
              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
              : 'rgba(255, 255, 255, 0.1)',
            transition: 'all 300ms ease-in-out',
            opacity: isUpdating ? 0.6 : 1,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '4px',
              left: isEnabled ? '36px' : '4px',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: '#ffffff',
              transition: 'all 300ms ease-in-out',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isUpdating && (
              <Loader2 size={14} style={{ color: '#6b7280', animation: 'spin 1s linear infinite' }} />
            )}
          </div>
        </button>
      </div>

      {!isEnabled && (
        <div
          style={{
            marginTop: '16px',
            padding: '12px 16px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
          }}
        >
          <p style={{ fontSize: '13px', color: '#fca5a5', margin: 0 }}>
            ⚠️ Warning: Subscription system is currently disabled. This is intended for testing purposes only.
          </p>
        </div>
      )}
    </div>
  );
}

