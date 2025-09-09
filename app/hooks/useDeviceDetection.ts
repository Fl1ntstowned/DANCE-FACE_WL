'use client';

import { useState, useEffect } from 'react';

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLowPerformance: boolean;
  screenWidth: number;
  screenHeight: number;
}

export function useDeviceDetection(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isLowPerformance: false,
    screenWidth: typeof window !== 'undefined' ? window.innerWidth : 1920,
    screenHeight: typeof window !== 'undefined' ? window.innerHeight : 1080,
  });

  useEffect(() => {
    const detectDevice = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as unknown as {opera?: string}).opera || '';
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      
      // Mobile detection
      const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      const isMobileScreen = screenWidth < 768;
      const isMobile = isMobileUA || isMobileScreen;
      
      // Tablet detection
      const isTabletUA = /ipad|tablet|playbook|silk/i.test(userAgent.toLowerCase());
      const isTabletScreen = screenWidth >= 768 && screenWidth < 1024;
      const isTablet = isTabletUA || isTabletScreen;
      
      // Desktop detection
      const isDesktop = !isMobile && !isTablet;
      
      // Performance detection
      let isLowPerformance = false;
      
      // Check for low-end device indicators
      if (isMobile) {
        // Check for device memory (if available)
        if ('deviceMemory' in navigator) {
          isLowPerformance = (navigator as unknown as {deviceMemory?: number}).deviceMemory ? (navigator as unknown as {deviceMemory: number}).deviceMemory < 4 : false;
        }
        
        // Check for hardware concurrency (CPU cores)
        if ('hardwareConcurrency' in navigator) {
          isLowPerformance = isLowPerformance || navigator.hardwareConcurrency < 4;
        }
        
        // Check connection speed (if available)
        if ('connection' in navigator) {
          const connection = (navigator as unknown as {connection?: {effectiveType?: string}}).connection;
          if (connection && 'effectiveType' in connection) {
            isLowPerformance = isLowPerformance || ['slow-2g', '2g', '3g'].includes(connection.effectiveType || '');
          }
        }
        
        // Default to treating all mobile as potentially low performance for safety
        isLowPerformance = true;
      }
      
      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        isLowPerformance,
        screenWidth,
        screenHeight,
      });
    };
    
    detectDevice();
    
    // Re-detect on resize
    const handleResize = () => {
      detectDevice();
    };
    
    window.addEventListener('resize', handleResize);
    
    // Re-detect on orientation change
    window.addEventListener('orientationchange', detectDevice);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', detectDevice);
    };
  }, []);
  
  return deviceInfo;
}