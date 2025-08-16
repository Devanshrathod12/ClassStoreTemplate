import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert
} from 'react-native';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../Redux/auth/authSlice';
import OtpInputs from 'react-native-otp-inputs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import Colors from '../../styles/colors';
import { scale, fontScale, verticalScale, moderateScale } from '../../styles/stylesconfig';

const WelcomeScreen = ({ navigation }) => {
    const [otpSent, setOtpSent] = useState(false);
    const [mobileNumber, setMobileNumber] = useState('');
    const [otp, setOtp] = useState("");

    const dispatch = useDispatch();

    const handleSendVerificationCode = () => {
        if (mobileNumber.length < 10) {
            Alert.alert("Validation Error", "Please enter a valid 10-digit mobile number.");
            return;
        }
        setOtpSent(true);
    };

    const handleVerify = () => {
        if (otp.length < 6) {
            Alert.alert("Incomplete OTP", "Please enter all 6 digits to continue.");
            return;
        }

        const customToken = `custom_token_${Date.now()}_${mobileNumber}`;

        dispatch(loginSuccess({
            user: { mobileNumber },
            token: customToken
        }));

        navigation.navigate("AddChild", { mobileNumber: mobileNumber });
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundLight} />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "padding"}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.headerContainer}>
                        <View style={styles.logoContainer}>
                            <MaterialCommunityIcons name="book-open-variant" size={scale(35)} color={Colors.textLight} />
                        </View>
                        <Text style={styles.appName}>ClassStore</Text>
                        <Text style={styles.tagline}>Your digital learning companion</Text>
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.statBox}>
                            <MaterialCommunityIcons name="book-multiple-outline" size={scale(22)} color={Colors.primary} />
                            <Text style={styles.statText}>10K+ Books</Text>
                        </View>
                        <View style={styles.statBox}>
                            <MaterialIcons name="school" size={scale(22)} color={Colors.button} />
                            <Text style={styles.statText}>Expert Authors</Text>
                        </View>
                        <View style={styles.statBox}>
                            <FontAwesome name="users" size={scale(20)} color={Colors.primary} />
                            <Text style={styles.statText}>1M+ Students</Text>
                        </View>
                    </View>

                    <View style={styles.formContainer}>
                        <Text style={styles.formTitle}>Welcome Back!</Text>
                        <Text style={styles.formSubtitle}>Sign in to access your learning journey</Text>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Mobile Number</Text>
                            <View style={styles.phoneInput}>
                                <Text style={styles.countryCode}>+91</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="1234567890"
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
                            <TouchableOpacity style={styles.button} onPress={handleSendVerificationCode}>
                                <Text style={styles.buttonText}>Send Verification Code</Text>
                            </TouchableOpacity>
                        ) : (
                            <>
                                <View style={styles.otpSentContainer}>
                                    <MaterialIcons name="check-circle" size={scale(16)} color={Colors.success} />
                                    <Text style={styles.otpSentText}>OTP sent to +91 {mobileNumber}</Text>
                                </View>

                                <TouchableOpacity style={styles.resendOtpButton}>
                                    <Text style={styles.resendOtpText}>Resend OTP</Text>
                                </TouchableOpacity>

                                <Text style={styles.inputLabel}>Enter Verification Code</Text>

                                <OtpInputs
                                    autofillFromClipboard={false}
                                    numberOfInputs={6}
                                    autoFocus
                                    style={styles.otpContainer}
                                    inputContainerStyles={styles.otpBox}
                                    inputStyles={styles.otpText}
                                    handleChange={setOtp}
                                />

                                <TouchableOpacity onPress={handleVerify} style={styles.verifyButton}>
                                    <Text style={styles.buttonText}>Verify & Continue</Text>
                                </TouchableOpacity>
                            </>
                        )}
                        <Text style={styles.termsText}>
                            By continuing, you agree to our Terms of Service and Privacy Policy.
                        </Text>
                    </View>

                    <View style={styles.footerContainer}>
                        <View style={styles.footerItem}>
                            <MaterialIcons name="verified-user" size={scale(16)} color={Colors.textMuted} />
                            <Text style={styles.footerText}>Trusted by millions</Text>
                        </View>
                        <View style={styles.footerItem}>
                            <MaterialCommunityIcons name="content-copy" size={scale(16)} color={Colors.textMuted} />
                            <Text style={styles.footerText}>Premium content</Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.backgroundLight,
    },
    content: {
        flexGrow: 1,
        alignItems: 'center',
        paddingHorizontal: scale(20),
        paddingBottom: verticalScale(20),
    },
    headerContainer: {
        alignItems: 'center',
        marginTop: verticalScale(15),
    },
    logoContainer: {
        width: scale(70),
        height: scale(70),
        borderRadius: moderateScale(18),
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(15),
    },
    appName: {
        fontSize: fontScale(28),
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    tagline: {
        fontSize: fontScale(14),
        color: Colors.textSecondary,
        marginTop: verticalScale(5),
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: verticalScale(25),
    },
    statBox: {
        flex: 1,
        backgroundColor: Colors.backgroundPrimaryLight,
        borderRadius: moderateScale(10),
        paddingVertical: verticalScale(12),
        alignItems: 'center',
        marginHorizontal: scale(5),
        borderWidth: 1,
        borderColor: Colors.borderLight,
    },
    statText: {
        fontSize: fontScale(12),
        color: Colors.textSecondary,
        marginTop: verticalScale(5),
    },
    formContainer: {
        width: '100%',
        backgroundColor: Colors.WhiteBackgroudcolor,
        borderRadius: moderateScale(12),
        padding: moderateScale(20),
        alignItems: 'center',
        marginTop: verticalScale(25),
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
    inputContainer: {
        width: '100%',
        marginBottom: verticalScale(20),
    },
    inputLabel: {
        fontSize: fontScale(14),
        color: Colors.textSecondary,
        alignSelf: 'flex-start',
        marginBottom: verticalScale(8),
        fontWeight: "500"
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
    countryCode: {
        fontSize: fontScale(16),
        color: Colors.textDark,
        marginRight: scale(8),
        fontWeight: '500',
    },
    input: {
        flex: 1,
        fontSize: fontScale(16),
        color: Colors.textDark,
        height: verticalScale(45),
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
    otpSentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        justifyContent: 'center',
        marginBottom: verticalScale(15),
    },
    otpSentText: {
        color: Colors.success,
        fontSize: fontScale(14),
        marginLeft: scale(5),
    },
    resendOtpButton: {
        width: '100%',
        paddingVertical: verticalScale(10),
        borderRadius: moderateScale(8),
        borderWidth: 1,
        borderColor: Colors.border,
        alignItems: 'center',
        marginBottom: verticalScale(15),
    },
    resendOtpText: {
        color: Colors.primary,
        fontSize: fontScale(13),
        fontWeight: 'bold',
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        alignSelf: 'center'
    },
    otpBox: {
        width: scale(45),
        height: scale(45),
        borderWidth: 1,
        borderRadius: moderateScale(8),
        borderColor: Colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    otpText: {
        fontSize: fontScale(18),
        color: Colors.textDark,
        textAlign: 'center',
    },
    termsText: {
        fontSize: fontScale(11),
        color: Colors.textMuted,
        textAlign: 'center',
        paddingHorizontal: scale(20),
        marginTop: verticalScale(20),
        lineHeight: verticalScale(16),
    },
    footerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        paddingVertical: verticalScale(10),
        marginTop: 'auto'
    },
    footerItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    footerText: {
        marginLeft: scale(8),
        fontSize: fontScale(12),
        color: Colors.textMuted,
    },
});

export default WelcomeScreen;