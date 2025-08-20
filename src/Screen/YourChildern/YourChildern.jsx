import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { logout } from '../../Redux/auth/authSlice';
import { resetChildren } from '../../Redux/childSlice/childSlice';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Colors from '../../styles/colors';
import { scale, fontScale, verticalScale, moderateScale } from '../../styles/stylesconfig';
import NavigationString from '../../Navigation/NavigationString';
import { apiGet } from '../../api/api';

const avatarColors = ['#FFC107', '#4CAF50', '#2196F3', '#E91E63', '#9C27B0', '#FF5722'];

const getInitials = (name) => {
    if (!name) return '';
    return name.charAt(0).toUpperCase();
};

const ChildCard = ({ child, index, onPress }) => {
    const cardColor = avatarColors[index % avatarColors.length];
    return (
        <TouchableOpacity style={styles.childCard} onPress={onPress}>
            <View style={[styles.cardAvatar, { backgroundColor: cardColor }]}>
                <Text style={styles.cardAvatarText}>{getInitials(child.name)}</Text>
            </View>
            <Text style={styles.cardName}>{child.name || 'No Name'}</Text>
            <View style={styles.cardDetailsContainer}>
                <View style={styles.cardDetailItem}>
                    <MaterialCommunityIcons name="cake-variant-outline" size={scale(14)} color={Colors.textSecondary} />
                    <Text style={styles.cardDetailText}>{child.age ? `${child.age} years` : 'N/A'}</Text>
                </View>
                <View style={styles.cardDetailItem}>
                    <MaterialCommunityIcons name="school-outline" size={scale(14)} color={Colors.textSecondary} />
                    <Text style={styles.cardDetailText}>{child.class_name || 'N/A'}</Text>
                </View>
            </View>
            <Text style={styles.cardSchoolName} numberOfLines={1}>{child.school_name || 'School not available'}</Text>
        </TouchableOpacity>
    );
};

const EmptyStateCard = ({ onPress }) => (
    <View style={styles.emptyStateContainer}>
        <MaterialCommunityIcons name="account-plus-outline" size={scale(40)} color={Colors.primary} />
        <Text style={styles.emptyStateTitle}>Add your first child</Text>
        <Text style={styles.emptyStateSubtitle}>
            Add a child to get personalized book recommendations and start ordering.
        </Text>
        <TouchableOpacity style={styles.emptyStateButton} onPress={onPress}>
            <Text style={styles.emptyStateButtonText}>Add Child</Text>
        </TouchableOpacity>
    </View>
);

const YourChildrenScreen = ({ navigation }) => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const mobileNumber = user?.mobileNumber || '';

    const [children, setChildren] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            const fetchChildren = async () => {
                setIsLoading(true);
                try {
                    const response = await apiGet("/api/v1/children");
                    if (response && Array.isArray(response)) {
                        setChildren(response);
                    } else {
                        setChildren([]);
                    }
                } catch (error) {
                    console.error("Bachho ki list fetch karne mein error:", error);
                    setChildren([]);
                    Alert.alert("Error", "Could not fetch children data.");
                } finally {
                    setIsLoading(false);
                }
            };

            fetchChildren();
        }, [])
    );



// useEffect(() => {
//     const fetchPublishers = async () => {
//         try {
//             const response = await apiGet("/api/v1/book");
//             if (response && Array.isArray(response)) {
//                 console.log("Publisher book:", response);
//             } else {
//                 console.log("Empty or invalid publisher list:", response);
//             }
//         } catch (error) {
//             console.error("Publisher list fetch karne mein error:", error);
//         }
//     };

//     fetchPublishers();
// }, []);  


// ye data get kr ke cahck krne ke liye kiya hai 





    
    const handleLogout = () => {
        dispatch(logout());
        dispatch(resetChildren());
    };

    const renderChildrenContent = () => {
        if (isLoading) {
            return (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            );
        }

        if (children.length > 0) {
            return (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalScrollContainer}
                >
                    {children.map((child, index) => (
                        <ChildCard
                            key={child.id}
                            child={child}
                            index={index}
                            onPress={() => navigation.navigate(NavigationString.SelectPackage, { child: child })}
                        />
                    ))}
                </ScrollView>
            );
        }

        return <EmptyStateCard onPress={() => navigation.navigate(NavigationString.AddChild)} />;
    };

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

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Your Children</Text>
                        {!isLoading && children.length > 0 && (
                             <TouchableOpacity 
                                style={styles.editButton}
                                onPress={() => navigation.navigate(NavigationString.AddChild, { editMode: true })}
                            >
                                <MaterialIcons name="edit" size={scale(18)} color={Colors.primary} />
                                <Text style={styles.editButtonText}>Edit</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    {renderChildrenContent()}
                </View>

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
                        <Text style={styles.exploreTitle}>Explore ClassStore</Text>
                        <TouchableOpacity style={styles.exploreItem} onPress={() => navigation.navigate(NavigationString.AddChild)}>
                            <MaterialCommunityIcons name="account-plus-outline" size={scale(20)} color={Colors.textSecondary} />
                            <Text style={styles.exploreItemText}>Add Another Child</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.exploreItem}>
                            <MaterialCommunityIcons name="cart-outline" size={scale(20)} color={Colors.textSecondary} />
                            <Text style={styles.exploreItemText}>My Cart</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.exploreItem}>
                            <MaterialCommunityIcons name="receipt-text-outline" size={scale(20)} color={Colors.textSecondary} />
                            <Text style={styles.exploreItemText}>My Orders</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.exploreItem, {borderBottomWidth: 0}]}>
                            <MaterialCommunityIcons name="cog-outline" size={scale(20)} color={Colors.textSecondary} />
                            <Text style={styles.exploreItemText}>Account Settings</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <Text style={styles.footerText}>Made with ❤️ for learners everywhere</Text>
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
        paddingBottom: verticalScale(30),
    },
    loaderContainer: {
        height: verticalScale(150),
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerContainer: {
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
        paddingVertical: verticalScale(12),
        paddingHorizontal: scale(16),
        borderRadius: moderateScale(12),
        marginTop: verticalScale(10),
        marginHorizontal: scale(16),
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
        marginTop: verticalScale(25),
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(15),
        paddingHorizontal: scale(16)
    },
    sectionTitle: {
        fontSize: fontScale(18),
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e7f3ff',
        paddingHorizontal: scale(10),
        paddingVertical: verticalScale(5),
        borderRadius: moderateScale(8),
    },
    editButtonText: {
        color: Colors.primary,
        fontWeight: 'bold',
        marginLeft: scale(4),
        fontSize: fontScale(13),
    },
    horizontalScrollContainer: {
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(5),
    },
    childCard: {
        backgroundColor: Colors.WhiteBackgroudcolor,
        borderRadius: moderateScale(16),
        padding: moderateScale(16),
        alignItems: 'center',
        width: scale(150),
        marginRight: scale(12),
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardAvatar: {
        width: scale(60),
        height: scale(60),
        borderRadius: scale(30),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(12),
        borderWidth: 2,
        borderColor: Colors.WhiteBackgroudcolor,
    },
    cardAvatarText: {
        fontSize: fontScale(24),
        fontWeight: 'bold',
        color: Colors.textLight,
    },
    cardName: {
        fontSize: fontScale(15),
        fontWeight: 'bold',
        color: Colors.textDark,
        marginBottom: verticalScale(6),
    },
    cardDetailsContainer: {
        flexDirection: 'row',
        marginBottom: verticalScale(6),
    },
    cardDetailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: scale(6),
    },
    cardDetailText: {
        fontSize: fontScale(12),
        color: Colors.textSecondary,
        marginLeft: scale(4),
    },
    cardSchoolName: {
        fontSize: fontScale(11),
        color: Colors.textMuted,
        textAlign: 'center',
    },
    emptyStateContainer: {
        backgroundColor: Colors.WhiteBackgroudcolor,
        borderRadius: moderateScale(16),
        padding: moderateScale(20),
        alignItems: 'center',
        marginHorizontal: scale(16),
        borderWidth: 1,
        borderColor: Colors.borderLight,
        borderStyle: 'dashed',
    },
    emptyStateTitle: {
        fontSize: fontScale(16),
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginTop: verticalScale(10),
    },
    emptyStateSubtitle: {
        fontSize: fontScale(13),
        color: Colors.textSecondary,
        textAlign: 'center',
        marginTop: verticalScale(4),
        marginBottom: verticalScale(15),
    },
    emptyStateButton: {
        backgroundColor: Colors.primary,
        paddingVertical: verticalScale(12),
        paddingHorizontal: scale(25),
        borderRadius: moderateScale(10),
    },
    emptyStateButtonText: {
        color: Colors.textLight,
        fontSize: fontScale(14),
        fontWeight: 'bold',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: verticalScale(20),
        paddingHorizontal: scale(16),
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
        marginHorizontal: scale(16),
        padding: moderateScale(12),
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    exploreTitle: {
        fontSize: fontScale(16),
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginBottom: verticalScale(12),
    },
    exploreItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: verticalScale(14),
        borderTopWidth: 1,
        borderTopColor: Colors.borderLight,
    },
    exploreItemText: {
        fontSize: fontScale(14),
        color: Colors.textSecondary,
        fontWeight: '500',
        marginLeft: scale(12),
    },
    footerText: {
        fontSize: fontScale(12),
        color: Colors.textMuted,
        marginTop: verticalScale(20),
        textAlign: 'center',
    },
});

export default YourChildrenScreen;