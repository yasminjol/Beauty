import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

type ClientProfile = {
  displayName: string;
  email: string;
  location: string;
  avatarVersion: number;
};

type UpdateProfileInput = {
  displayName: string;
  location: string;
};

type ClientProfileContextValue = {
  profile: ClientProfile;
  updateProfile: (input: UpdateProfileInput) => void;
  bumpAvatarVersion: () => void;
};

const ClientProfileContext = createContext<ClientProfileContextValue | undefined>(undefined);

function getDefaultDisplayName(email?: string, fallbackName?: string) {
  if (fallbackName && fallbackName.trim().length) {
    return fallbackName.trim();
  }

  if (email && email.includes('@')) {
    const username = email.split('@')[0];
    return username
      .split(/[._-]/g)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  return 'Client';
}

export function ClientProfileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [profile, setProfile] = useState<ClientProfile>(() => ({
    displayName: getDefaultDisplayName(user?.email, user?.name),
    email: user?.email ?? 'client@ewaji.co',
    location: 'New York, NY',
    avatarVersion: 0,
  }));

  useEffect(() => {
    setProfile((current) => {
      const nextEmail = user?.email ?? current.email;
      const incomingName = getDefaultDisplayName(user?.email, user?.name);

      return {
        ...current,
        email: nextEmail,
        displayName:
          current.displayName === 'Client' || current.displayName === '' ? incomingName : current.displayName,
      };
    });
  }, [user?.email, user?.name]);

  const updateProfile = useCallback((input: UpdateProfileInput) => {
    setProfile((current) => ({
      ...current,
      displayName: input.displayName.trim(),
      location: input.location.trim(),
    }));
  }, []);

  const bumpAvatarVersion = useCallback(() => {
    setProfile((current) => ({
      ...current,
      avatarVersion: current.avatarVersion + 1,
    }));
  }, []);

  const value = useMemo(
    () => ({
      profile,
      updateProfile,
      bumpAvatarVersion,
    }),
    [profile, updateProfile, bumpAvatarVersion],
  );

  return <ClientProfileContext.Provider value={value}>{children}</ClientProfileContext.Provider>;
}

export function useClientProfile() {
  const context = useContext(ClientProfileContext);

  if (!context) {
    throw new Error('useClientProfile must be used within ClientProfileProvider');
  }

  return context;
}
