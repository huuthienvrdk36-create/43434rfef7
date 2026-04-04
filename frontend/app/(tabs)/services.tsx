import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { servicesAPI, organizationsAPI } from '../../src/services/api';

export default function ServicesScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [catsRes, orgsRes] = await Promise.all([
        servicesAPI.getCategories(),
        organizationsAPI.getAll({ limit: 20 }),
      ]);
      
      // Handle different response formats
      const catsData = catsRes.data;
      if (Array.isArray(catsData)) {
        setCategories(catsData);
      } else {
        setCategories([]);
      }
      
      const orgsData = orgsRes.data;
      if (Array.isArray(orgsData)) {
        setOrganizations(orgsData);
      } else if (orgsData?.organizations) {
        setOrganizations(orgsData.organizations);
      } else {
        setOrganizations([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setCategories([]);
      setOrganizations([]);
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
      <View style={styles.header}>
        <Text style={styles.title}>Услуги и СТО</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
        }
      >
        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Категории</Text>
          {loading ? (
            <ActivityIndicator color="#3B82F6" style={{ marginTop: 20 }} />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  !selectedCategory && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(null)}
              >
                <Text style={[
                  styles.categoryChipText,
                  !selectedCategory && styles.categoryChipTextActive,
                ]}>
                  Все
                </Text>
              </TouchableOpacity>
              {categories.map((cat: any, index: number) => (
                <TouchableOpacity
                  key={cat._id || index}
                  style={[
                    styles.categoryChip,
                    selectedCategory === cat._id && styles.categoryChipActive,
                  ]}
                  onPress={() => setSelectedCategory(cat._id)}
                >
                  <Text style={[
                    styles.categoryChipText,
                    selectedCategory === cat._id && styles.categoryChipTextActive,
                  ]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Organizations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Автосервисы</Text>
          {loading ? (
            <ActivityIndicator color="#3B82F6" style={{ marginTop: 20 }} />
          ) : organizations.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="business-outline" size={64} color="#6B7280" />
              <Text style={styles.emptyTitle}>СТО не найдены</Text>
              <Text style={styles.emptyText}>Попробуйте изменить фильтры</Text>
            </View>
          ) : (
            organizations.map((org: any, index: number) => (
              <TouchableOpacity
                key={org._id || index}
                style={styles.orgCard}
                onPress={() => router.push(`/organization/${org._id}`)}
              >
                <View style={styles.orgHeader}>
                  <View style={styles.orgAvatar}>
                    <Ionicons name="business" size={28} color="#3B82F6" />
                  </View>
                  <View style={styles.orgInfo}>
                    <View style={styles.orgNameRow}>
                      <Text style={styles.orgName}>{org.name}</Text>
                      {org.isBoosted && (
                        <View style={styles.boostBadge}>
                          <Ionicons name="flame" size={12} color="#F59E0B" />
                        </View>
                      )}
                    </View>
                    <View style={styles.orgRating}>
                      <Ionicons name="star" size={14} color="#F59E0B" />
                      <Text style={styles.orgRatingText}>
                        {org.ratingAvg?.toFixed(1) || '5.0'}
                      </Text>
                      <Text style={styles.orgReviews}>
                        ({org.reviewsCount || 0} отзывов)
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.orgFooter}>
                  <View style={styles.orgStat}>
                    <Ionicons name="location" size={14} color="#6B7280" />
                    <Text style={styles.orgStatText}>Москва</Text>
                  </View>
                  <View style={styles.orgStat}>
                    <Ionicons name="time" size={14} color="#6B7280" />
                    <Text style={styles.orgStatText}>Быстрый ответ</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  categoriesScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#3B82F6',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  orgCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  orgHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orgAvatar: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orgInfo: {
    flex: 1,
    marginLeft: 12,
  },
  orgNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orgName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  boostBadge: {
    marginLeft: 8,
    padding: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  orgRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  orgRatingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
    marginLeft: 4,
  },
  orgReviews: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 4,
  },
  orgFooter: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  orgStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  orgStatText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
});
