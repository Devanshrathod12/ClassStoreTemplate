import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from 'react-native';
import { showMessage } from 'react-native-flash-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../../styles/colors';
import {
  scale,
  fontScale,
  verticalScale,
  moderateScale,
} from '../../styles/stylesconfig';
import { apiPost } from '../../api/api';
import AdaptiveSafeAreaView from '../AdaptiveSafeAreaView';

const CustomOtpInput = ({ numberOfInputs = 6, onCodeFilled, onCodeChange }) => {
  const [code, setCode] = useState(Array(numberOfInputs).fill(''));
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (text, index) => {
    const numericText = text.replace(/[^0-9]/g, '');
    
    if (numericText.length > 0) {
      const newCode = [...code];
      newCode[index] = numericText.charAt(0);
      setCode(newCode);
      
      onCodeChange && onCodeChange(newCode.join(''));
      
      if (index < numberOfInputs - 1 && numericText) {
        inputRefs.current[index + 1].focus();
        setFocusedIndex(index + 1);
      }
      
      if (newCode.every(digit => digit !== '') && newCode.join('').length === numberOfInputs) {
        onCodeFilled && onCodeFilled(newCode.join(''));
      }
    } else if (text === '') {
      const newCode = [...code];
      newCode[index] = '';
      setCode(newCode);
      
      onCodeChange && onCodeChange(newCode.join(''));
      
      if (index > 0) {
        inputRefs.current[index - 1].focus();
        setFocusedIndex(index - 1);
      }
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && code[index] === '' && index > 0) {
      inputRefs.current[index - 1].focus();
      setFocusedIndex(index - 1);
    }
  };

  const handleFocus = (index) => {
    setFocusedIndex(index);
  };

  return (
    <View style={styles.otpContainer}>
      {Array(numberOfInputs)
        .fill()
        .map((_, index) => (
          <TouchableWithoutFeedback
            key={index}
            onPress={() => {
              inputRefs.current[index].focus();
              setFocusedIndex(index);
            }}
          >
            <View
              style={[
                styles.otpBox,
                focusedIndex === index && styles.otpBoxFocused,
              ]}
            >
              <TextInput
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={styles.otpText}
                value={code[index]}
                onChangeText={(text) => handleChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                onFocus={() => handleFocus(index)}
                keyboardType="numeric"
                maxLength={1}
                selectTextOnFocus
                caretHidden={true}
              />
              {focusedIndex === index && code[index] === '' && (
                <View style={styles.cursor} />
              )}
            </View>
          </TouchableWithoutFeedback>
        ))}
    </View>
  );
};

const WelcomeScreen = ({ onLoginSuccess }) => {
  const [otpSent, setOtpSent] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(true);

  const timerIntervalRef = useRef(null);

  useEffect(() => {
    if (otpSent) {
      setIsResendDisabled(true);
      setResendTimer(30);
      timerIntervalRef.current = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            setIsResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [otpSent]);

  const handleSendVerificationCode = async (isResend = false) => {
    if (mobileNumber.length < 10) {
      showMessage({
        message: 'Invalid Number',
        description: 'Please enter a valid 10-digit mobile number.',
        type: 'warning',
      });
      return;
    }
    setIsLoading(true);
    try {
      const payload = { mobile_number: mobileNumber };
      const response = await apiPost('/api/v1/user/send-otp', payload);
      if (response.otp_sent) {
        setOtpSent(true);
        showMessage({
          message: isResend ? 'OTP Resent Successfully' : 'OTP Sent Successfully',
          description: response.message || `An OTP has been sent to +91 ${mobileNumber}`,
          type: 'success',
        });
      } else {
        showMessage({
          message: 'Error',
          description: response.message || 'Failed to send OTP. Please try again.',
          type: 'danger',
        });
      }
    } catch (error) {
      let errorMsg = 'An unexpected error occurred while sending the OTP.';
      if (error.response?.data?.message) errorMsg = error.response.data.message;
      else if (error.message) errorMsg = error.message;
      showMessage({
        message: 'Failed to Send OTP',
        description: errorMsg,
        type: 'danger',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (otp.length < 6) {
      showMessage({
        message: 'Incomplete OTP',
        description: 'Please enter all 6 digits of the OTP to continue.',
        type: 'warning',
      });
      return;
    }
    setIsLoading(true);
    try {
      const payload = { mobile_number: mobileNumber, otp: otp };
      const response = await apiPost('/api/v1/user/verify-otp', payload);
      if (response.token) {
        try {
          await AsyncStorage.setItem('user_token', response.token);
          await AsyncStorage.setItem('userId', String(response.user_id));
          await AsyncStorage.setItem('mobile_number', String(response.mobile_number));
          showMessage({
            message: 'Verification Successful!',
            description: response.message || 'You have been successfully verified!',
            type: 'success',
          });
          if (onLoginSuccess) onLoginSuccess();
        } catch (storageError) {
          console.error('Failed to save user token to storage', storageError);
          showMessage({
            message: 'Session Error',
            description: 'Could not save your session. Please try logging in again.',
            type: 'danger',
          });
        }
      } else {
        showMessage({
          message: 'Verification Failed',
          description:
            response.message || 'The OTP entered is incorrect. Please try again.',
          type: 'danger',
        });
      }
    } catch (error) {
      let errorMsg = 'An unexpected error occurred during OTP verification.';
      if (error.response?.data?.message) errorMsg = error.response.data.message;
      else if (error.message) errorMsg = error.message;
      showMessage({
        message: 'Verification Error',
        description: errorMsg,
        type: 'danger',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditNumber = () => {
    setOtpSent(false);
    setOtp('');
  };

  return (
    <AdaptiveSafeAreaView>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <StatusBar
          barStyle="dark-content"
          backgroundColor={Colors.backgroundLight}
        />
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}> Login / Signup</Text>
            <Text style={styles.formSubtitle}>
               access your learning journey
            </Text>

            <View style={styles.inputContainer}>
              <View style={styles.inputLabelContainer}>
                <Text style={styles.inputLabel}>Mobile Number</Text>
                {otpSent && (
                  <TouchableOpacity onPress={handleEditNumber}>
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.phoneInput}>
                  <View style={styles.countryContainer}>
                      <Text style={styles.countryFlag}>🇮🇳</Text>
                      <Text style={styles.countryCode}>+91</Text>
                      <View style={styles.verticalLine} />
                  </View>
                  <TextInput
                      style={styles.input}
                      placeholder=""
                      placeholderTextColor={Colors.textMuted}
                      keyboardType="phone-pad"
                      editable={!otpSent}
                      value={mobileNumber}
                      onChangeText={setMobileNumber}
                      maxLength={10}
                  />
              </View>
            </View>

            {!otpSent ? (
              <TouchableOpacity
                style={styles.button}
                onPress={() => handleSendVerificationCode(false)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={Colors.textLight} />
                ) : (
                  <Text style={styles.buttonText}>Send Verification Code</Text>
                )}
              </TouchableOpacity>
            ) : (
              <>
                <Text style={styles.inputLabelotp}>Enter Verification Code</Text>
                
                <CustomOtpInput 
                  numberOfInputs={6}
                  onCodeFilled={setOtp}
                  onCodeChange={setOtp}
                />

                <TouchableOpacity
                  style={[
                    styles.resendOtpButton,
                    isResendDisabled && styles.disabledButton,
                  ]}
                  onPress={() => handleSendVerificationCode(true)}
                  disabled={isResendDisabled || isLoading}
                >
                  <Text
                    style={[
                      styles.resendOtpText,
                      isResendDisabled && styles.disabledButtonText,
                    ]}
                  >
                    {isResendDisabled
                      ? `Resend OTP in ${resendTimer}s`
                      : 'Resend OTP'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleVerify}
                  style={styles.verifyButton}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color={Colors.textLight} />
                  ) : (
                    <Text style={styles.buttonText}>Verify & Continue</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
            <Text style={styles.termsText}>
              By continuing, you agree to our Terms of Service and Privacy
              Policy.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AdaptiveSafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundLight },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(20),
  },
  formContainer: {
    width: '100%',
    backgroundColor: Colors.WhiteBackgroudcolor,
    borderRadius: moderateScale(12),
    padding: moderateScale(20),
    alignItems: 'center',
    marginTop: verticalScale(30),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  formTitle: {
    fontSize: fontScale(22),
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  formSubtitle: {
    fontSize: fontScale(14),
    color: Colors.textMuted,
    marginTop: verticalScale(5),
    textAlign: 'center',
    marginBottom: verticalScale(20),
  },
  inputContainer: { width: '100%', marginBottom: verticalScale(20) },
  inputLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: verticalScale(8),
  },
  inputLabel: {
    fontSize: fontScale(14),
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  inputLabelotp: {
    alignSelf: 'flex-start',
    fontSize: fontScale(14),
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: verticalScale(12),
  },
  editButtonText: {
    fontSize: fontScale(13),
    color: Colors.primary,
    fontWeight: 'bold',
  },
  phoneInput: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: moderateScale(8),
    paddingHorizontal: scale(10),
    backgroundColor: Colors.WhiteBackgroudcolor,
  },
  countryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: scale(8),
  },
  countryFlag: {
    fontSize: fontScale(24),
  },
  countryCode: {
    fontSize: fontScale(16),
    color: Colors.textDark,
    fontWeight: '500',
    marginLeft: scale(8),
  },
  verticalLine: {
      width: 1,
      height: '60%',
      backgroundColor: Colors.border,
      marginLeft: scale(10),
  },
  input: {
    flex: 1,
    fontSize: fontScale(16),
    color: Colors.textDark,
    height: verticalScale(45),
    marginLeft: scale(4)
  },
  button: {
    width: '100%',
    backgroundColor: Colors.primary,
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(8),
    alignItems: 'center',
  },
  verifyButton: {
    width: '100%',
    backgroundColor: Colors.button,
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(8),
    alignItems: 'center',
    marginTop: verticalScale(20),
  },
  buttonText: {
    color: Colors.textLight,
    fontSize: fontScale(16),
    fontWeight: 'bold',
  },
  resendOtpButton: {
    width: '100%',
    alignItems: 'center',
    marginTop: verticalScale(20),
  },
  resendOtpText: {
    color: Colors.primary,
    fontSize: fontScale(13),
    fontWeight: 'bold',
  },
  disabledButton: {},
  disabledButtonText: { color: '#a0a0a0' },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  otpBox: {
    width: scale(48),
    height: scale(48),
    borderWidth: 1.5,
    borderRadius: moderateScale(10),
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundFaded,
    position: 'relative',
  },
  otpBoxFocused: {
    borderColor: Colors.primary,
    borderWidth: 2,
    backgroundColor: Colors.WhiteBackgroudcolor,
  },
  otpText: {
    fontSize: fontScale(20),
    fontWeight: 'bold',
    color: Colors.textDark,
    textAlign: 'center',
    width: '100%',
  },
   cursor: {
    position: 'absolute',
    width: 2,
    height: scale(25),
    backgroundColor: Colors.primary,
    borderRadius: 1,
  },
  termsText: {
    fontSize: fontScale(11),
    color: Colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: scale(20),
    marginTop: verticalScale(25),
    lineHeight: verticalScale(16),
  },
});

export default WelcomeScreen;