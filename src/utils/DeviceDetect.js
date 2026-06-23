/**
 * DeviceDetect.js — Device type and capability detection
 */

export const DeviceDetect = {
  detect() {
    const ua   = navigator.userAgent;
    const w    = window.innerWidth;
    const touch = navigator.maxTouchPoints > 0;

    let type = 'desktop';

    // TV detection
    const isTV = /TV|SmartTV|SMART-TV|WebOS|Tizen|NetCast|BRAVIA|AndroidTV|HbbTV/i.test(ua);
    if (isTV) type = 'tv';
    else if (/iPhone/i.test(ua)) type = 'mobile';
    else if (/iPad/i.test(ua) || (touch && w >= 768 && w < 1200)) type = 'tablet';
    else if (touch && w < 768) type = 'mobile';

    // VR/XR check
    const hasXR = !!navigator.xr;

    return {
      type,
      isMobile:  type === 'mobile',
      isTablet:  type === 'tablet',
      isDesktop: type === 'desktop',
      isTV:      type === 'tv',
      hasXR,
      hasTouchScreen: touch,
      pixelRatio: devicePixelRatio,
      screenWidth:  screen.width,
      screenHeight: screen.height,
    };
  },
};
