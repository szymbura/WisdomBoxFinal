import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, ExternalLink, CircleCheck as CheckCircle, CircleAlert as AlertCircle } from 'lucide-react-native';
import { useState, useEffect, useRef } from 'react';
import { evsProducts } from '@/data/evsData';
import SoundManager from '@/utils/soundManager';

// Products that show "Coming Soon" instead of launching
const COMING_SOON_PRODUCTS = ['xt3', 'multicam-lsm', 'xt-via'];

type LoadingStep = {
  message: string;
  duration: number;
};

export default function LaunchScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [launchStatus, setLaunchStatus] = useState<'loading' | 'success' | 'error' | 'complete'>('loading');
  const [currentStep, setCurrentStep] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isComingSoon, setIsComingSoon] = useState(false);
  
  const soundManager = SoundManager.getInstance();
  const product = evsProducts.find(p => p.id === id);
  const isComingSoonProduct = COMING_SOON_PRODUCTS.includes(id || '');
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const spinValue = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const successAnim = useRef(new Animated.Value(0)).current;
  const welcomeAnim = useRef(new Animated.Value(0)).current;
  
  // AI Flux Glow animations
  const fluxGlow1 = useRef(new Animated.Value(0)).current;
  const fluxGlow2 = useRef(new Animated.Value(0)).current;
  const fluxGlow3 = useRef(new Animated.Value(0)).current;
  const energyCore = useRef(new Animated.Value(0)).current;
  const energyWave1 = useRef(new Animated.Value(0)).current;
  const energyWave2 = useRef(new Animated.Value(0)).current;
  const energyWave3 = useRef(new Animated.Value(0)).current;
  const fluxPulse = useRef(new Animated.Value(1)).current;
  const energyRotation = useRef(new Animated.Value(0)).current;

  const loadingSteps: LoadingStep[] = [
    { message: 'Loading resources...', duration: 600 },
    { message: 'Preparing interface...', duration: 500 },
    { message: 'Connecting to database...', duration: 700 },
    { message: 'Loading articles...', duration: 600 },
    { message: isComingSoonProduct ? 'Checking availability...' : `${product?.title} successfully initialized`, duration: 500 }
  ];

  // Spinning animation for loader
  useEffect(() => {
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    );
    spinAnimation.start();
    return () => spinAnimation.stop();
  }, []);

  // AI Flux Glow animations
  useEffect(() => {
    if (launchStatus === 'success' && isComingSoon) {
      // Energy Core Pulse Animation
      const coreAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(energyCore, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(energyCore, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );

      // Energy Wave Animations (staggered)
      const createWaveAnimation = (animValue: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(animValue, {
              toValue: 1,
              duration: 3000,
              useNativeDriver: true,
            }),
            Animated.timing(animValue, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        );
      };

      // Slow rotation for organic feel
      const rotationAnimation = Animated.loop(
        Animated.timing(energyRotation, {
          toValue: 1,
          duration: 12000,
          useNativeDriver: true,
        })
      );

      // Main pulse animation
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(fluxPulse, {
            toValue: 1.15,
            duration: 2500,
            useNativeDriver: true,
          }),
          Animated.timing(fluxPulse, {
            toValue: 1,
            duration: 2500,
            useNativeDriver: true,
          }),
        ])
      );

      // Start all animations
      coreAnimation.start();
      createWaveAnimation(energyWave1, 0).start();
      createWaveAnimation(energyWave2, 1000).start();
      createWaveAnimation(energyWave3, 2000).start();
      rotationAnimation.start();
      pulseAnimation.start();

      return () => {
        energyCore.stopAnimation();
        energyWave1.stopAnimation();
        energyWave2.stopAnimation();
        energyWave3.stopAnimation();
        energyRotation.stopAnimation();
        fluxPulse.stopAnimation();
      };
    }
  }, [launchStatus, isComingSoon]);
  // Main loading sequence
  useEffect(() => {
    // Initialize sound manager
    soundManager.loadSounds();
    
    if (launchStatus !== 'loading') return;

    const runLoadingSequence = async () => {
      // Play short loading sound at the start
      console.log('🔊 Playing loading sound...');
      await soundManager.playLoadingSound();
      
      // Simulate random failure (10% chance)
      const shouldFail = Math.random() < 0.1;
      
      for (let i = 0; i < loadingSteps.length; i++) {
        if (shouldFail && i === 2) {
          // Fail at database connection step
          setLaunchStatus('error');
          return;
        }
        
        setCurrentStep(i);
        
        // Animate progress bar
        Animated.timing(progressAnim, {
          toValue: (i + 1) / loadingSteps.length,
          duration: loadingSteps[i].duration,
          useNativeDriver: false,
        }).start();
        
        await new Promise(resolve => setTimeout(resolve, loadingSteps[i].duration));
      }
      
      // Success sequence
      soundManager.playSuccessSound();
      
      if (isComingSoonProduct) {
        setIsComingSoon(true);
        setLaunchStatus('success');
      } else {
        setLaunchStatus('success');
      }
      
      // Success animation
      Animated.sequence([
        Animated.timing(successAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(800),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        })
      ]).start(() => {
        setLaunchStatus('complete');
        setShowWelcome(true);
        
        // Welcome message animation
        Animated.timing(welcomeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      });
    };

    runLoadingSequence();
  }, [launchStatus]);

  const handleRetry = () => {
    setLaunchStatus('loading');
    setCurrentStep(0);
    fadeAnim.setValue(1);
    progressAnim.setValue(0);
    successAnim.setValue(0);
    welcomeAnim.setValue(0);
    setShowWelcome(false);
    setIsComingSoon(false);
  };

  const handleViewArticles = () => {
    router.push(`/product/${id}`);
  };

  if (!product) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Product not found</Text>
      </View>
    );
  }

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const fluxRotate = fluxRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const energyRotate = energyRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>Launch {product.title}</Text>
      </View>

      {/* Loading Screen */}
      {(launchStatus === 'loading' || launchStatus === 'success') && (
        <Animated.View style={[styles.loadingContainer, { opacity: fadeAnim }]}>
          <View style={styles.loadingContent}>
            
            {launchStatus === 'loading' && (
              <>
                {/* Animated Spinner */}
                <Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]}>
                  <View style={styles.spinnerOuter}>
                    <View style={styles.spinnerInner} />
                  </View>
                </Animated.View>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressTrack}>
                    <Animated.View 
                      style={[
                        styles.progressFill,
                        {
                          width: progressAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0%', '100%'],
                          })
                        }
                      ]} 
                    />
                  </View>
                </View>

                {/* Status Message */}
                <Text style={styles.loadingMessage}>
                  {loadingSteps[currentStep]?.message}
                </Text>

                {/* Pulsing Dots */}
                <View style={styles.dotsContainer}>
                  {[0, 1, 2].map((index) => (
                    <Animated.View
                      key={index}
                      style={[
                        styles.dot,
                        {
                          opacity: progressAnim.interpolate({
                            inputRange: [0, 0.33, 0.66, 1],
                            outputRange: index === 0 ? [0.3, 1, 0.3, 0.3] : 
                                       index === 1 ? [0.3, 0.3, 1, 0.3] : 
                                       [0.3, 0.3, 0.3, 1],
                          })
                        }
                      ]}
                    />
                  ))}
                </View>
              </>
            )}

            {launchStatus === 'success' && (
              <Animated.View style={[styles.successContainer, { 
                opacity: successAnim,
                transform: [{ scale: successAnim }]
              }]}>
                {isComingSoon ? (
                  <>
                    {/* Energy Flux Ball Animation */}
                    <View style={styles.energyFluxContainer}>
                      {/* Outer Energy Waves */}
                      <Animated.View style={[
                        styles.energyWave,
                        styles.energyWave1,
                        {
                          opacity: energyWave1.interpolate({
                            inputRange: [0, 0.5, 1],
                            outputRange: [0.2, 0.8, 0.2],
                          }),
                          transform: [
                            { rotate: energyRotate },
                            { scale: Animated.multiply(fluxPulse, energyWave1.interpolate({
                              inputRange: [0, 1],
                              outputRange: [1, 1.3],
                            }))}
                          ]
                        }
                      ]} />
                      <Animated.View style={[
                        styles.energyWave,
                        styles.energyWave2,
                        {
                          opacity: energyWave2.interpolate({
                            inputRange: [0, 0.5, 1],
                            outputRange: [0.3, 0.9, 0.3],
                          }),
                          transform: [
                            { rotate: energyRotate },
                            { scale: Animated.multiply(fluxPulse, energyWave2.interpolate({
                              inputRange: [0, 1],
                              outputRange: [1, 1.2],
                            }))}
                          ]
                        }
                      ]} />
                      <Animated.View style={[
                        styles.energyWave,
                        styles.energyWave3,
                        {
                          opacity: energyWave3.interpolate({
                            inputRange: [0, 0.5, 1],
                            outputRange: [0.4, 1, 0.4],
                          }),
                          transform: [
                            { rotate: energyRotate },
                            { scale: Animated.multiply(fluxPulse, energyWave3.interpolate({
                              inputRange: [0, 1],
                              outputRange: [1, 1.1],
                            }))}
                          ]
                        }
                      ]} />
                      
                      {/* Central Energy Core */}
                      <Animated.View style={[
                        styles.energyCore,
                        {
                          opacity: energyCore.interpolate({
                            inputRange: [0, 0.5, 1],
                            outputRange: [0.8, 1, 0.8],
                          }),
                          transform: [
                            { scale: Animated.multiply(fluxPulse, energyCore.interpolate({
                              inputRange: [0, 1],
                              outputRange: [1, 1.1],
                            }))},
                            { rotate: energyRotate }
                          ]
                        }
                      ]}>
                        {/* Inner gradient layers */}
                        <View style={styles.energyCoreInner}>
                          <View style={styles.energyCoreCenter} />
                        </View>
                      </Animated.View>
                    </View>
                    
                    <Text style={styles.comingSoonTitle}>Coming Soon!</Text>
                    <Text style={styles.comingSoonMessage}>
                      {product.title} is powering up with new broadcast intelligence
                    </Text>
                  </>
                ) : (
                  <>
                    <CheckCircle size={80} color="#10b981" />
                    <Text style={styles.successTitle}>Initialization Complete!</Text>
                    <Text style={styles.successMessage}>
                      {product.title} is ready to use
                    </Text>
                  </>
                )}
              </Animated.View>
            )}
          </View>
        </Animated.View>
      )}

      {/* Error State */}
      {launchStatus === 'error' && (
        <View style={styles.errorContainer}>
          <AlertCircle size={64} color="#ef4444" style={styles.errorIcon} />
          <Text style={styles.errorTitle}>Initialization Failed</Text>
          <Text style={styles.errorDescription}>
            Failed to connect to database. Please check your network connection and try again.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Retry Initialization</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Welcome Screen */}
      {launchStatus === 'complete' && showWelcome && (
        <Animated.View style={[styles.welcomeContainer, { 
          opacity: welcomeAnim,
          transform: [{ 
            translateY: welcomeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            })
          }]
        }]}>
          <View style={styles.welcomeContent}>
            {isComingSoon ? (
              <View style={styles.welcomeAiContainer}>
                <Animated.View style={[
                  styles.welcomeEnergyCore,
                  {
                    transform: [
                      { rotate: energyRotate },
                      { scale: fluxPulse }
                    ]
                  }
                ]} />
                <View style={styles.welcomeEnergyCoreInner}>
                  <View style={styles.welcomeEnergyCoreCenter} />
                </View>
              </View>
            ) : (
              <View style={styles.welcomeIcon}>
                <CheckCircle size={48} color="#10b981" />
              </View>
            )}
            

            {isComingSoon ? (
              <>
                <Text style={styles.welcomeTitle}>{product.title} - Coming Soon</Text>
                <Text style={styles.welcomeDescription}>
                  This tool is currently under development. Check back soon for the full experience with comprehensive knowledge base and interactive features.
                </Text>
                
                <TouchableOpacity style={styles.comingSoonButton} onPress={handleViewArticles}>
                  <Text style={styles.comingSoonButtonText}>View Available Content</Text>
                  <ExternalLink size={20} color="#ffffff" style={styles.buttonIcon} />
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.welcomeTitle}>Welcome to {product.title}</Text>
                <Text style={styles.welcomeDescription}>
                  Access comprehensive knowledge base, troubleshooting guides, and best practices.
                </Text>

                <TouchableOpacity style={styles.articlesButton} onPress={handleViewArticles}>
                  <Text style={styles.articlesButtonText}>View Articles</Text>
                  <ExternalLink size={20} color="#ffffff" style={styles.buttonIcon} />
                </TouchableOpacity>
              </>
            )}
            {/* Tool Status */}
            <View style={styles.statusCard}>
              <View style={styles.statusIndicator}>
                <View style={[
                  styles.statusDot,
                  { backgroundColor: isComingSoon ? '#f59e0b' : (product.status === 'online' ? '#10b981' : '#ef4444') }
                ]} />
                <Text style={styles.statusText}>
                  System Status: {isComingSoon ? 'In Development' : product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                </Text>
              </View>
              <Text style={styles.statusDescription}>
                {isComingSoon ? 'Development in progress' : `${product.wisdomBlocks.length} knowledge articles available`}
              </Text>
            </View>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingContent: {
    alignItems: 'center',
    width: '100%',
  },
  spinner: {
    marginBottom: 40,
  },
  spinnerOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#334155',
    borderTopColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinnerInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    opacity: 0.3,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 32,
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#334155',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 3,
  },
  loadingMessage: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '500',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
  },
  successContainer: {
    alignItems: 'center',
  },
  // Energy Flux Ball Styles
  energyFluxContainer: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  energyWave: {
    position: 'absolute',
    borderRadius: 100,
  },
  energyWave1: {
    width: 140,
    height: 140,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 25,
    elevation: 25,
  },
  energyWave2: {
    width: 100,
    height: 100,
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.4)',
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 20,
    elevation: 20,
  },
  energyWave3: {
    width: 70,
    height: 70,
    backgroundColor: 'rgba(139, 92, 246, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.5)',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 15,
  },
  energyCore: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.9)',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 20,
  },
  energyCoreInner: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: 'rgba(6, 182, 212, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  energyCoreCenter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 20,
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 16,
    color: '#10b981',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorIcon: {
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorDescription: {
    fontSize: 16,
    color: '#cbd5e1',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  welcomeContainer: {
    flex: 1,
    padding: 20,
  },
  welcomeContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeIcon: {
    marginBottom: 24,
  },
  // Welcome AI Flux Styles
  welcomeAiContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeEnergyCore: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.4)',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 15,
  },
  welcomeEnergyCoreInner: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(59, 130, 246, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeEnergyCoreCenter: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeDescription: {
    fontSize: 16,
    color: '#cbd5e1',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  articlesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 40,
  },
  articlesButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
  statusCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
    width: '100%',
    maxWidth: 400,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  statusDescription: {
    fontSize: 14,
    color: '#64748b',
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 50,
  },
  comingSoonTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 12,
    textAlign: 'center',
  },
  comingSoonMessage: {
    fontSize: 16,
    color: '#06b6d4',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  comingSoonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f59e0b',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 40,
  },
  comingSoonButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginRight: 8,
  },
});