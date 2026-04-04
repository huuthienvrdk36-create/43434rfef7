import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { organizationsAPI, servicesAPI } from '../../src/services/api';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const [orgsRes, catsRes] = await Promise.all([
        organizationsAPI.getAll({ limit: 5 }),
        servicesAPI.getCategories(),
      ]);
      // Handle different response formats
      const orgsData = orgsRes.data;
      if (Array.isArray(orgsData)) {
        setOrganizations(orgsData);
      } else if (orgsData?.organizations) {
        setOrganizations(orgsData.organizations);
      } else {
        setOrganizations([]);
      }
      
      const catsData = catsRes.data;
      if (Array.isArray(catsData)) {
        setCategories(catsData);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setOrganizations([]);
      setCategories([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
        }
      >
        {/* Header with Logo */}
        <View style={styles.header}>
          <Image
            source={require('../../assets/logo-light.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          {user && (
            <Text style={styles.greeting}>
              Привет, {user.firstName || 'Пользователь'}!
            </Text>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Быстрые действия</Text>
          <View style={styles.actionsGrid}>
            <QuickAction
              icon="search"
              title="Найти СТО"
              onPress={() => router.push('/(tabs)/services')}
              color="#3B82F6"
            />
            <QuickAction
              icon="add-circle"
              title="Новая заявка"
              onPress={() => router.push('/create-quote')}
              color="#10B981"
            />
            <QuickAction
              icon="car"
              title="Мой гараж"
              onPress={() => router.push('/(tabs)/garage')}
              color="#F59E0B"
            />
            <QuickAction
              icon="time"
              title="Записи"
              onPress={() => router.push('/(tabs)/quotes')}
              color="#8B5CF6"
            />
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Категории услуг</Text>
          {loading ? (
            <ActivityIndicator color="#3B82F6" style={{ marginTop: 20 }} />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
              {categories.slice(0, 6).map((cat: any, index: number) => (
                <TouchableOpacity
                  key={cat._id || index}
                  style={styles.categoryCard}
                  onPress={() => router.push(`/(tabs)/services?category=${cat._id}`)}
                >
                  <View style={styles.categoryIcon}>
                    <Ionicons name="build" size={24} color="#3B82F6" />
                  </View>
                  <Text style={styles.categoryName} numberOfLines={2}>
                    {cat.name || 'Услуга'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Top Organizations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Лучшие СТО</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/services')}>
              <Text style={styles.seeAll}>Все</Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <ActivityIndicator color="#3B82F6" style={{ marginTop: 20 }} />
          ) : organizations.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="business-outline" size={48} color="#6B7280" />
              <Text style={styles.emptyText}>СТО не найдены</Text>
            </View>
          ) : (
            organizations.map((org: any, index: number) => (
              <TouchableOpacity
                key={org._id || index}
                style={styles.orgCard}
                onPress={() => router.push(`/organization/${org._id}`)}
              >
                <View style={styles.orgAvatar}>
                  <Ionicons name="business" size={28} color="#3B82F6" />
                </View>
                <View style={styles.orgInfo}>
                  <Text style={styles.orgName}>{org.name}</Text>
                  <View style={styles.orgRating}>
                    <Ionicons name="star" size={14} color="#F59E0B" />
                    <Text style={styles.orgRatingText}>
                      {org.ratingAvg?.toFixed(1) || '5.0'} ({org.reviewsCount || 0} отзывов)
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#6B7280" />
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function QuickAction({ icon, title, onPress, color }: any) {
  return (
    <TouchableOpacity style={styles.actionCard} onPress={onPress}>
      <View style={[styles.actionIcon, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.actionTitle}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    alignItems: 'center',
  },
  logo: {
    width: width * 0.7,
    height: 100,
  },
  greeting: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 8,
  },
  quickActions: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionCard: {
    width: (width - 52) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#E5E7EB',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  seeAll: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  categoriesScroll: {
    marginTop: 16,
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  categoryCard: {
    width: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    color: '#E5E7EB',
    textAlign: 'center',
  },
  orgCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  orgAvatar: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orgInfo: {
    flex: 1,
    marginLeft: 12,
  },
  orgName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  orgRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orgRatingText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },
});
