import React from 'react';
import { Tabs } from 'expo-router';
import { Home, FileText, Briefcase, Users, BarChart3, User } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { StyleSheet, View } from 'react-native';

const TabBarIcon = ({ name, color, size }: { name: string; color: string; size: number }) => {
  const isQuotes = name === 'quotes';
  
  if (isQuotes) {
    return (
      <View style={styles.quotesIconContainer}>
        <FileText size={size - 4} color={colors.white} />
      </View>
    );
  }
  
  switch (name) {
    case 'index':
      return <Home size={size} color={color} />;
    case 'customers':
      return <Users size={size} color={color} />;
    case 'jobs':
      return <Briefcase size={size} color={color} />;
    case 'pipeline':
      return <BarChart3 size={size} color={color} />;
    case 'profile':
      return <User size={size} color={color} />;
    default:
      return <Home size={size} color={color} />;
  }
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray[500],
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.gray[200],
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 0,
          height: 0,
        },
        tabBarShowLabel: false,
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          return <TabBarIcon name={route.name} color={color} size={size} />;
        },
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
        }}
      />
      <Tabs.Screen
        name="customers"
        options={{
          title: 'Customers',
        }}
      />
      <Tabs.Screen
        name="quotes"
        options={{
          title: 'Quotes',
          tabBarActiveTintColor: colors.white,
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: 'Jobs',
        }}
      />
      <Tabs.Screen
        name="pipeline"
        options={{
          title: 'Financials',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  quotesIconContainer: {
    backgroundColor: '#4CAF50',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: -4,
  },
});