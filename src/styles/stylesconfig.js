import { Dimensions, StatusBar, Platform } from "react-native";

// ab device ki dimention get karenge jo denahia or jo actual hogi 
const { width, height } = Dimensions.get("window");

// desgin guidlines dimentions hai ye phone ke liye jo hr phne ka hota hai
// jaise ye avraj phone ke liye hai 
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

// ye jo function hai wo scaling ke liye hai 

// ye jo hai wo scale hai jo width se / hoti hai or aapko actual scale deti hai
const scale = (size) => (width / guidelineBaseWidth) * size;

// ye verticalscale hai jo ki vertical height or verticaly chijo ke liye hai 
const verticalScale = (size) => (height / guidelineBaseHeight) * size;

// modrate scale jo ki kisi font or element ke size ko scale deti hai jha avoid krna hota hai scale lightwate version hai 
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;
const moderateScaleVertical = (size, factor = 0.5) => size + (verticalScale(size) - size) * factor;

// text ki scaling improve kr liye hai hai 
const textScale = (percent) => {
  // screen ka height or width nikala 
  const screenHeight = height;
  const screenWidth = width;

  // aspect ratio nikalna 
  const aspectRatio = screenHeight / screenWidth;

  // aspect ratio ke base pr screen size niklgi 
  let scaleFactor;

  if (aspectRatio > 2.1) {
    // badi screen ke liye hai like 6.67 inches tall screen
    scaleFactor = 0.122;
  } else if (aspectRatio > 1.9) {
    // ye mid screens ke liye 
    scaleFactor = 0.135;
  } else {
    // choti screen ke liye
    scaleFactor = 0.15;
  }

  // yha calculation hoga height 
  const effectiveHeight = Platform.OS === "android"
    ? screenHeight - (StatusBar.currentHeight || 0)
    : screenHeight;

  const scaledSize = (percent * effectiveHeight * scaleFactor) / 100;
  return Math.round(scaledSize);
};

// font scale ke liye hai ye device size ke hisabh se font scale hogi
const fontScale = (size) => {
  const baseWidth = 375;
  const scaleFactor = width / baseWidth;

  const minScale = 0.85;
  const maxScale = 1.3;
  const boundedScale = Math.max(minScale, Math.min(maxScale, scaleFactor));

  return Math.round(size * boundedScale);
};

// responsive breakpoint bole to point that is a limit of the screen
const isSmallDevice = () => width < 375;
const isMediumDevice = () => width >= 375 && width < 414;
const isLargeDevice = () => width >= 414;
const isTablet = () => width >= 768;

// responsive value helper for responsive screens
const responsiveValue = (small, medium, large, tablet) => {
  if (isTablet()) return tablet || large;
  if (isLargeDevice()) return large;
  if (isMediumDevice()) return medium;
  return small; // fallback for small devices
};

export {
  // ye dimension hai 
  width,
  height,

  // scale ke liye jo function banaye hai wo 
  scale,
  verticalScale,
  moderateScale,
  moderateScaleVertical,
  textScale,
  fontScale,

  // device ke liye jo ki device chota bada ke liye hai 
  isSmallDevice,
  isMediumDevice,
  isLargeDevice,
  isTablet,
  responsiveValue
};