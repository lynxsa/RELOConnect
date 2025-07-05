import React, { useState } from 'react';
import RN from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuthStore } from '../../store';
import { Button, Input } from '../../components/ui';

const {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} = RN;

export default function LoginScreen() {
  const { colors } = useTheme();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      // Mock authentication for testing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockUser = {
        id: '1',
        email,
        phone: '+1234567890',
        firstName: 'John',
        lastName: 'Doe',
        role: 'user' as const,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      login(mockUser);
      Alert.alert('Success', 'Welcome to RELOConnect!');
    } catch (error) {
      Alert.alert('Error', 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={colors.gradient.primary as [string, string]}
        style={styles.header}
      >
        <Text style={styles.logo}>RELOConnect</Text>
        <Text style={styles.subtitle}>Your trusted moving partner</Text>
      </LinearGradient>

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          Sign in to your account to continue
        </Text>

        <View style={styles.form}>
          <Input
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            leftIcon={<Ionicons name="mail-outline" size={20} color={colors.textSecondary} />}
          />

          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry={!showPassword}
            leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />}
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>
            }
          />

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            style={styles.loginButton}
          />
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Don't have an account?{' '}
          </Text>
          <TouchableOpacity>
            <Text style={[styles.signUpText, { color: colors.primary }]}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 24,
    marginTop: -30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    marginTop: 20,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    marginBottom: 32,
  },
  loginButton: {
    height: 50,
    marginTop: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
  },
  signUpText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
