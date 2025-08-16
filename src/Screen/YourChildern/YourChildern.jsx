import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    ScrollView,
    TouchableOpacity
} from 'react-native';
import { useSelector } from 'react-redux';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import Colors from '../../styles/colors';
import { scale, fontScale, verticalScale, moderateScale } from '../../styles/stylesconfig';
import NavigationString from '../../Navigation/NavigationString';

const YourChildrenScreen = ({ navigation }) => {
    const { user } = useSelector((state) => state.auth);
    const { children } = useSelector((state) => state.child);
    const mobileNumber = user?.mobileNumber || '';

    const getInitials = (name) => {
        if (!name) return '';
        return name.charAt(0).toUpperCase();
    };

    const hasChildrenToShow = children.some(c => c.name || c.age || c.standard);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundLight} />
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.headerContainer}>
                    <View style={styles.logoContainer}>
                        <MaterialCommunityIcons name="book-open-variant" size={scale(28)} color={Colors.textLight} />
                    </View>
                    <Text style={styles.appName}>ClassStore</Text>
                </View>
                <View style={styles.welcomeBanner}>
                    <View style={styles.welcomeIconCircle}>
                        <MaterialIcons name="check" size={scale(20)} color={Colors.success} />
                    </View>
                    <View>
                        <Text style={styles.welcomeText}>Welcome back!</Text>
                        <Text style={styles.welcomeNumber}>+91 {mobileNumber}</Text>
                    </View>
                </View>
                {hasChildrenToShow && (
                    <View style={styles.childrenSectionCard}>
                        <View style={styles.sectionHeader}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <FontAwesome name="users" size={scale(16)} color={Colors.primary} />
                                <Text style={styles.sectionTitle}>Your Children</Text>
                            </View>
                            <TouchableOpacity onPress={() => navigation.navigate(NavigationString.AddChild)}>
                                <MaterialIcons name="edit" size={scale(18)} color={Colors.textMuted} />
                            </TouchableOpacity>
                        </View>
                        {children.map((child, index) => {
                            if (!child.name && !child.age && !child.standard) {
                                return null;
                            }
                            return (
                                <View key={index} style={styles.childItemContainer}>
                                    <View style={styles.childInfo}>
                                        <View style={styles.childAvatar}>
                                            <Text style={styles.childAvatarText}>{getInitials(child.name)}</Text>
                                        </View>
                                        <View>
                                            <Text style={styles.childName}>{child.name || 'No Name'}</Text>
                                            <Text style={styles.childDetails}>
                                                {child.age ? `${child.age} years` : ''}{child.standard ? ` - ${child.standard}` : ''}
                                            </Text>
                                            <Text style={styles.childSchool}>{child.schoolName}</Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.orderButton}
                                        onPress={() => navigation.navigate(NavigationString.SelectPackage, { child: child })}
                                    >
                                        <MaterialCommunityIcons name="cart-outline" size={scale(16)} color={Colors.textLight} />
                                        <Text style={styles.orderButtonText}>Order Now {child.standard ? `- ${child.standard} Bundle` : ''}</Text>
                                    </TouchableOpacity>
                                </View>
                            );
                        })}
                    </View>
                )}
                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <MaterialCommunityIcons name="book-open-page-variant-outline" size={scale(22)} color={Colors.primary} />
                        <Text style={styles.statValue}>24 Books</Text>
                        <Text style={styles.statLabel}>Recommended</Text>
                    </View>
                    <View style={styles.statBox}>
                        <MaterialCommunityIcons name="progress-check" size={scale(22)} color={Colors.success} />
                        <Text style={styles.statValue}>92%</Text>
                        <Text style={styles.statLabel}>Progress</Text>
                    </View>
                </View>
                <View style={styles.section}>
                    <View style={styles.exploreCard}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Explore ClassStore</Text>
                        </View>
                        <TouchableOpacity style={[styles.exploreItem, styles.exploreItemSelected]}>
                            <MaterialIcons name="search" size={scale(18)} color={Colors.textLight} />
                            <Text style={styles.exploreItemTextSelected}>School-Specific Books</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.exploreItem}>
                            <MaterialCommunityIcons name="receipt-text-outline" size={scale(18)} color={Colors.textSecondary} />
                            <Text style={styles.exploreItemText}>My Orders</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.exploreItem, { borderBottomWidth: 0 }]}>
                            <MaterialCommunityIcons name="star-outline" size={scale(20)} color={Colors.textSecondary} />
                            <Text style={styles.exploreItemText}>Wishlist</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
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
        paddingHorizontal: scale(16),
        paddingBottom: verticalScale(30),
    },
    headerContainer: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: verticalScale(10),
    },
    logoContainer: {
        width: scale(50),
        height: scale(50),
        borderRadius: moderateScale(12),
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(8),
    },
    appName: {
        fontSize: fontScale(18),
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    welcomeBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.success,
        width: '100%',
        paddingVertical: verticalScale(12),
        paddingHorizontal: scale(16),
        borderRadius: moderateScale(12),
        marginTop: verticalScale(10),
    },
    welcomeIconCircle: {
        width: scale(32),
        height: scale(32),
        borderRadius: scale(16),
        backgroundColor: Colors.textLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: scale(12),
    },
    welcomeText: {
        color: Colors.textLight,
        fontSize: fontScale(14),
        fontWeight: 'bold',
    },
    welcomeNumber: {
        color: Colors.textLight,
        fontSize: fontScale(12),
        fontWeight: '500',
    },
    section: {
        width: '100%',
        marginTop: verticalScale(20),
    },
    childrenSectionCard: {
        width: '100%',
        marginTop: verticalScale(20),
        backgroundColor: Colors.WhiteBackgroudcolor,
        borderRadius: moderateScale(12),
        padding: moderateScale(12),
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(10),
        paddingHorizontal: scale(4)
    },
    sectionTitle: {
        fontSize: fontScale(16),
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginLeft: scale(8)
    },
    childItemContainer: {
        borderTopWidth: 1,
        borderTopColor: Colors.borderLight,
        paddingTop: verticalScale(12),
        marginTop: verticalScale(5),
    },
    childInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    childAvatar: {
        width: scale(40),
        height: scale(40),
        borderRadius: moderateScale(8),
        backgroundColor: Colors.backgroundPrimaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: scale(12),
    },
    childAvatarText: {
        fontSize: fontScale(18),
        fontWeight: 'bold',
        color: Colors.primary,
    },
    childName: {
        fontSize: fontScale(14),
        fontWeight: 'bold',
        color: Colors.textDark,
        marginBottom: verticalScale(2),
    },
    childDetails: {
        fontSize: fontScale(12),
        color: Colors.textSecondary,
        marginBottom: verticalScale(2),
    },
    childSchool: {
        fontSize: fontScale(11),
        color: Colors.textMuted,
    },
    orderButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.danger,
        paddingVertical: verticalScale(10),
        borderRadius: moderateScale(8),
        marginTop: verticalScale(12),
    },
    orderButtonText: {
        color: Colors.textLight,
        fontSize: fontScale(14),
        fontWeight: 'bold',
        marginLeft: scale(8),
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: verticalScale(20),
    },
    statBox: {
        backgroundColor: Colors.WhiteBackgroudcolor,
        borderRadius: moderateScale(12),
        padding: moderateScale(12),
        alignItems: 'center',
        width: '48%',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    statValue: {
        fontSize: fontScale(14),
        fontWeight: 'bold',
        color: Colors.textDark,
        marginTop: verticalScale(4),
    },
    statLabel: {
        fontSize: fontScale(12),
        color: Colors.textMuted,
    },
    exploreCard: {
        backgroundColor: Colors.WhiteBackgroudcolor,
        borderRadius: moderateScale(12),
        padding: moderateScale(12),
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    exploreItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: verticalScale(12),
        paddingHorizontal: scale(8),
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
    },
    exploreItemSelected: {
        backgroundColor: Colors.primary,
        borderRadius: moderateScale(8),
    },
    exploreItemText: {
        fontSize: fontScale(14),
        color: Colors.textSecondary,
        fontWeight: '500',
        marginLeft: scale(12),
    },
    exploreItemTextSelected: {
        fontSize: fontScale(14),
        color: Colors.textLight,
        fontWeight: 'bold',
        marginLeft: scale(12),
    },
});

export default YourChildrenScreen;