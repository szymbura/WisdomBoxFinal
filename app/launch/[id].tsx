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
  const fluxRotation = useRef(new Animated.Value(0)).current;
  const fluxPulse = useRef(new Animated.Value(1)).current;

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
      // Start flux glow animations
      const createFluxAnimation = (animValue: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(animValue, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(animValue, {
              toValue: 0,
              duration: 2000,
              useNativeDriver: true,
            }),
          ])
        );
      };

      const rotationAnimation = Animated.loop(
        Animated.timing(fluxRotation, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: true,
        })
      );

      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(fluxPulse, {
            toValue: 1.1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(fluxPulse, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      );

      createFluxAnimation(fluxGlow1, 0).start();
      createFluxAnimation(fluxGlow2, 800).start();
      createFluxAnimation(fluxGlow3, 1600).start();
      rotationAnimation.start();
      pulseAnimation.start();

      return () => {
        fluxGlow1.stopAnimation();
        fluxGlow2.stopAnimation();
        fluxGlow3.stopAnimation();
        fluxRotation.stopAnimation();
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
                    {/* AI Flux Glow Animation */}
                    <View style={styles.aiFluxContainer}>
                      <Animated.View style={[
                        styles.fluxGlow,
                        styles.fluxGlow1,
                        {
                          opacity: fluxGlow1,
                          transform: [
                            { rotate: fluxRotate },
                            { scale: fluxPulse }
                          ]
                        }
                      ]} />
                      <Animated.View style={[
                        styles.fluxGlow,
                        styles.fluxGlow2,
                        {
                          opacity: fluxGlow2,
                          transform: [
                            { rotate: fluxRotate },
                            { scale: fluxPulse }
                          ]
                        }
                      ]} />
                      <Animated.View style={[
                        styles.fluxGlow,
                        styles.fluxGlow3,
                        {
                          opacity: fluxGlow3,
                          transform: [
                            { rotate: fluxRotate },
                            { scale: fluxPulse }
                          ]
                        }
                      ]} />
                      
                      {/* Central AI Core */}
                      <Animated.View style={[
                        styles.aiCore,
                        {
                          transform: [{ scale: fluxPulse }]
                        }
                      ]}>
                        <Text style={styles.aiCoreText}>🤖</Text>
                      </Animated.View>
                    </View>
                    <View style={styles.comingSoonIcon}>
                      <Text style={styles.comingSoonEmoji}>🚧</Text>
                    </View>
                    <Text style={styles.comingSoonTitle}>Coming Soon!</Text>
                    <Text style={styles.comingSoonMessage}>
                      {product.title} is currently under development
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
                  styles.welcomeFluxGlow,
                  {
                    transform: [
                      { rotate: fluxRotate },
                      { scale: fluxPulse }
                    ]
                  }
                ]} />
                <View style={styles.welcomeAiCore}>
                  <Text style={styles.welcomeAiEmoji}>🤖</Text>
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
  // AI Flux Glow Styles
  aiFluxContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  fluxGlow: {
    position: 'absolute',
    borderRadius: 60,
    borderWidth: 2,
  },
  fluxGlow1: {
    width: 120,
    height: 120,
    borderColor: '#3b82f6',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
  },
  fluxGlow2: {
    width: 90,
    height: 90,
    borderColor: '#06b6d4',
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 15,
  },
  fluxGlow3: {
    width: 60,
    height: 60,
    borderColor: '#8b5cf6',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  aiCore: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3b82f6',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 15,
  },
  aiCoreText: {
    fontSize: 24,
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
  welcomeFluxGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#3b82f6',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 15,
  },
  welcomeAiCore: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  welcomeAiEmoji: {
    fontSize: 20,
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
    color: '#f59e0b',
    marginBottom: 8,
    textAlign: 'center',
  },
  comingSoonMessage: {
    fontSize: 16,
    color: '#f59e0b',
    textAlign: 'center',
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