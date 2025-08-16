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
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import Colors from '../../styles/colors';
import { scale, fontScale, verticalScale, moderateScale } from '../../styles/stylesconfig';
import NavigationString from '../../Navigation/NavigationString';

const packagesData = [
    { id: 1, title: 'Early Foundation Pack', popular: true, price: 899, originalPrice: 1199, description: 'Perfect for building basic learning foundations.', books: ['Picture Story Books (5)', 'Activity Workbooks (3)', 'Coloring Books (2)', 'Number & Alphabet Charts'], subjects: ['Pre-reading', 'Pre-Math', 'Creative Arts', 'Motor Skills'], features: ['Age-appropriate content', 'Interactive activities', 'Parent guidance included', 'Colorful illustrations'] },
    { id: 2, title: 'Advanced Learner Kit', popular: false, price: 1299, originalPrice: 1599, description: 'Designed to challenge and enhance skills.', books: ['Chapter Story Books (4)', 'Science Workbooks (3)', 'Creative Writing Guides (2)', 'World Atlas & Maps'], subjects: ['Reading Comprehension', 'Basic Science', 'Writing Skills', 'Geography'], features: ['Advanced curriculum', 'Critical thinking exercises', 'Independent learning focus', 'Detailed illustrations'] },
    { id: 3, title: 'Hobby Explorer Bundle', popular: false, price: 1599, originalPrice: 1999, description: 'Explore new interests and creative hobbies.', books: ['DIY Craft Books (3)', 'Beginner Coding Guide (1)', 'Musical Instrument Basics (2)', 'Gardening for Kids'], subjects: ['Arts & Crafts', 'Logic & Coding', 'Music Theory', 'Botany'], features: ['Hands-on projects', 'Fun and engaging topics', 'Develops new hobbies', 'Step-by-step guides'] },
];

const SelectPackageScreen = ({ route, navigation }) => {
    const child = route.params?.child;

    if (!child) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                    <Text style={{ fontSize: 18, color: 'red', textAlign: 'center' }}>Error: Could not load child details.</Text>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={{ color: Colors.primary, marginTop: 15, fontSize: 16 }}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const renderPackage = (pkg) => {
        const savedAmount = pkg.originalPrice - pkg.price;
        return (
            <View key={pkg.id} style={styles.packageCard}>
                <View style={styles.packageHeader}>
                    <View style={styles.packageInfo}>
                        <Text style={styles.packageTitle}>{pkg.title}</Text>
                        <Text style={styles.packageDescription}>{pkg.description}</Text>
                    </View>
                    <View style={styles.priceContainer}>
                        {pkg.popular && <View style={styles.popularTag}><Text style={styles.popularText}>★ Popular</Text></View>}
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
                            <Text style={styles.originalPrice}>₹{pkg.originalPrice}</Text>
                            <Text style={styles.finalPrice}>₹{pkg.price}</Text>
                        </View>
                        <View style={styles.saveTag}><Text style={styles.saveText}>Save ₹{savedAmount}</Text></View>
                    </View>
                </View>
                <View style={styles.detailsSection}>
                    <Text style={styles.detailTitle}><MaterialCommunityIcons name="bookshelf" /> Books Included</Text>
                    {pkg.books.map((book, i) => <Text key={i} style={styles.detailItem}>- {book}</Text>)}
                </View>
                <View style={styles.detailsSection}>
                    <Text style={styles.detailTitle}>Subjects Covered</Text>
                    <View style={styles.subjectsContainer}>
                        {pkg.subjects.map((subject, i) => <View key={i} style={styles.subjectTag}><Text style={styles.subjectText}>{subject}</Text></View>)}
                    </View>
                </View>
                <View style={styles.detailsSection}>
                    <Text style={styles.detailTitle}>Key Features</Text>
                    {pkg.features.map((feature, i) => <Text key={i} style={styles.featureItem}><MaterialIcons name="check" color={Colors.success} /> {feature}</Text>)}
                </View>
                <TouchableOpacity 
                    style={styles.orderButton}
                    onPress={() => navigation.navigate(NavigationString.DeliveryAddress, { child: child, pkg: pkg })}
                >
                    <MaterialCommunityIcons name="cart-check" size={scale(18)} color={Colors.textLight} />
                    <Text style={styles.orderButtonText}>Order This Bundle</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundLight} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialIcons name="arrow-back" size={scale(24)} color={Colors.textPrimary} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Select Bundle</Text>
                    <Text style={styles.headerSubtitle}>For {child.name} • {child.standard} standard</Text>
                </View>
                <View style={{ width: scale(24) }} />
            </View>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.childBanner}>
                    <View style={styles.childIconCircle} />
                    <View>
                        <Text style={styles.childName}>{child.name}</Text>
                        <Text style={styles.childDetails}>{child.age} years • {child.schoolName}</Text>
                    </View>
                </View>
                {packagesData.map(pkg => renderPackage(pkg))}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: moderateScale(16),
        backgroundColor: Colors.backgroundLight,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
    },
    headerTitle: {
        fontSize: fontScale(18),
        fontWeight: 'bold',
        color: Colors.textPrimary,
        textAlign: 'center'
    },
    headerSubtitle: {
        fontSize: fontScale(12),
        color: Colors.textSecondary,
        textAlign: 'center'
    },
    content: {
        flexGrow: 1,
        paddingHorizontal: scale(16),
        paddingBottom: verticalScale(30),
        backgroundColor: Colors.backgroundLight,
    },
    childBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary,
        width: '100%',
        paddingVertical: verticalScale(12),
        paddingHorizontal: scale(16),
        borderRadius: moderateScale(12),
        marginTop: verticalScale(20),
        marginBottom: verticalScale(20),
    },
    childIconCircle: {
        width: scale(32),
        height: scale(32),
        borderRadius: scale(16),
        backgroundColor: Colors.textLight,
        marginRight: scale(12),
    },
    childName: {
        color: Colors.textLight,
        fontSize: fontScale(14),
        fontWeight: 'bold',
    },
    childDetails: {
        color: Colors.textLight,
        fontSize: fontScale(12),
    },
    packageCard: {
        backgroundColor: Colors.WhiteBackgroudcolor,
        borderRadius: moderateScale(12),
        padding: moderateScale(14),
        marginBottom: verticalScale(20),
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    packageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
        paddingBottom: verticalScale(10),
    },
    packageInfo: {
        flex: 1,
        marginRight: scale(8),
    },
    packageTitle: {
        fontSize: fontScale(16),
        fontWeight: 'bold',
        color: Colors.textDark,
    },
    packageDescription: {
        fontSize: fontScale(12),
        color: Colors.textMuted,
        marginTop: verticalScale(4),
    },
    priceContainer: {
        alignItems: 'flex-end',
    },
    popularTag: {
        backgroundColor: Colors.backgroundPrimaryLight,
        borderRadius: moderateScale(6),
        paddingHorizontal: scale(8),
        paddingVertical: verticalScale(3),
        marginBottom: verticalScale(4),
    },
    popularText: {
        color: Colors.primary,
        fontSize: fontScale(11),
        fontWeight: 'bold',
    },
    originalPrice: {
        textDecorationLine: 'line-through',
        color: Colors.textMuted,
        fontSize: fontScale(12),
        marginRight: scale(6),
    },
    finalPrice: {
        color: Colors.success,
        fontSize: fontScale(18),
        fontWeight: 'bold',
    },
    saveTag: {
        backgroundColor: '#FFEBEE',
        borderRadius: moderateScale(6),
        paddingHorizontal: scale(8),
        paddingVertical: verticalScale(3),
        marginTop: verticalScale(4),
    },
    saveText: {
        color: Colors.danger,
        fontSize: fontScale(11),
        fontWeight: 'bold',
    },
    detailsSection: {
        marginTop: verticalScale(12),
    },
    detailTitle: {
        fontSize: fontScale(14),
        fontWeight: 'bold',
        color: Colors.textDark,
        marginBottom: verticalScale(8),
    },
    detailItem: {
        fontSize: fontScale(13),
        color: Colors.textSecondary,
        marginBottom: verticalScale(4),
        marginLeft: scale(8),
    },
    subjectsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    subjectTag: {
        backgroundColor: Colors.backgroundFaded,
        borderRadius: moderateScale(6),
        paddingHorizontal: scale(10),
        paddingVertical: verticalScale(5),
        marginRight: scale(8),
        marginBottom: scale(8),
    },
    subjectText: {
        fontSize: fontScale(12),
        color: Colors.textSecondary,
    },
    featureItem: {
        fontSize: fontScale(13),
        color: Colors.textSecondary,
        marginBottom: verticalScale(5),
    },
    orderButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.button,
        paddingVertical: verticalScale(12),
        borderRadius: moderateScale(8),
        marginTop: verticalScale(15),
    },
    orderButtonText: {
        color: Colors.textLight,
        fontSize: fontScale(16),
        fontWeight: 'bold',
        marginLeft: scale(8),
        
    },
});

export default SelectPackageScreen;