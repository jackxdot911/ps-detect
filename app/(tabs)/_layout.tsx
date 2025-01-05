import { Tabs } from "expo-router";
import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet } from "react-native";
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const TabButton = ({ children, onPress, accessibilityState } : any) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (accessibilityState?.selected) {
      scale.value = withSpring(1.1, { damping: 15 });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      scale.value = withSpring(1);
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [accessibilityState?.selected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <AnimatedPressable
      onPress={(event) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.(event);
      }}
      style={[styles.tabButton, animatedStyle]}
    >
      <Animated.View
        style={[styles.glowBackground, glowStyle]}
      />
      {children}
    </AnimatedPressable>
  );
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: (props) => (
          <TabButton {...props} />
        ),
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabBarItem,
        tabBarActiveTintColor: '#4A4AFF',
        tabBarInactiveTintColor: '#6F6F87',
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={24} name="home" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="recent"
        options={{
          title: "Recent",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={24} name="image" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="workout"
        options={{
          title: "Workout",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={24} name="heart" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={24} name="user" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 70,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 5,
  },
  tabBarItem: {
    padding: 8,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  glowBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(74, 74, 255, 0.08)',
    borderRadius: 8,
  }
});