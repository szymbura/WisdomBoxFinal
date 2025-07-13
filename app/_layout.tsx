import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import SoundManager from '@/utils/soundManager';

export default function RootLayout() {
  useFrameworkReady();

  useEffect(() => {
    // Initialize sound manager when app starts
    const soundManager = SoundManager.getInstance();
    soundManager.loadSounds();
    
    // Cleanup on unmount
    return () => {
      soundManager.cleanup();
    };
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="product/[id]" />
        <Stack.Screen name="flipbook/[id]" />
        <Stack.Screen name="launch/[id]" />
        <Stack.Screen name="wisdom/[id]" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}