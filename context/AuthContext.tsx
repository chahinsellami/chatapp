"use client";

/**
 * Authentication Context for React App
 * Provides global authentication state and methods throughout the application
 * Manages user login, signup, logout, and session persistence
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

/**
 * User interface defining the structure of user data
 * Used throughout the app for displaying user information
 */
export interface User {
  id: string;           // Unique user identifier
  username: string;     // User's display name
  email: string;        // User's email address
  avatar?: string;      // Profile picture URL
  status?: string;      // Online/offline/away status
  bio?: string;         // User biography
  createdAt?: string;   // Account creation timestamp
}

/**
 * Authentication context interface
 * Defines all authentication-related state and methods available to components
 */
export interface AuthContextType {
  user: User | null;                    // Current authenticated user or null
  isLoading: boolean;                   // Whether auth operations are in progress
  isLoggedIn: boolean;                  // Computed boolean for login status
  token: string | null;                 // JWT token for API authentication
  login: (email: string, password: string) => Promise<User>;  // Login method
  signup: (username: string, email: string, password: string, passwordConfirm: string) => Promise<void>; // Signup method
  logout: () => void;                   // Logout method
  updateUser: (user: User) => void;     // Update user data method
}

/**
 * React Context for authentication state
 * Components can access auth state by using useAuth() hook
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Authentication Provider Component
 * Wraps the app to provide authentication context to all child components
 * Manages authentication state and session persistence
 * @param children - Child components that need access to auth context
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  // Authentication state
  const [user, setUser] = useState<User | null>(null);        // Current user data
  const [token, setToken] = useState<string | null>(null);    // JWT token
  const [isLoading, setIsLoading] = useState(true);          // Loading state for initial auth check

  /**
   * Check authentication status on app load
   * Attempts to restore user session from localStorage token
   * Verifies token validity with backend before setting user state
   */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Retrieve saved token from browser storage
        const savedToken = localStorage.getItem("auth_token");
        if (savedToken) {
          setToken(savedToken);

          // Validate token with backend API
          const response = await fetch("/api/auth/me", {
            headers: {
              Authorization: `Bearer ${savedToken}`,
            },
          });

          if (response.ok) {
            const userData = await response.json();
            setUser(userData); // Token valid, restore user session
          } else {
            // Token invalid/expired, clear stored data
            localStorage.removeItem("auth_token");
            setToken(null);
          }
        }
      } catch (error) {
        // Network or other error, clear any stored auth data
        console.error("Auth check failed:", error);
      } finally {
        setIsLoading(false); // Auth check complete
      }
    };

    checkAuth();
  }, []);

  /**
   * Authenticate user with email and password
   * Makes API call to login endpoint and stores session data
   * @param email - User's email address
   * @param password - User's password
   * @returns User data if login successful
   * @throws Error if login fails
   */
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Login failed");
      }

      const data = await response.json();
      // Store authentication data
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("auth_token", data.token);
      return data.user;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Register a new user account
   * Creates new account and automatically logs in the user
   * @param username - Desired username
   * @param email - User's email address
   * @param password - User's password
   * @param passwordConfirm - Password confirmation
   * @throws Error if signup fails
   */
  const signup = async (
    username: string,
    email: string,
    password: string,
    passwordConfirm: string
  ) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          password,
          passwordConfirm,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Signup failed");
      }

      const data = await response.json();
      // Auto-login after successful registration
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("auth_token", data.token);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Log out the current user
   * Clears all authentication state and removes stored session data
   */
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth_token");
  };

  /**
   * Update current user data in context
   * Used when user profile is updated elsewhere in the app
   * @param newUser - Updated user object
   */
  const updateUser = (newUser: User) => {
    setUser(newUser);
  };

  // Context value object containing all auth state and methods
  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isLoggedIn: !!user, // Computed property for login status
    login,
    signup,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to access authentication context
 * Must be used within an AuthProvider component
 * @returns Authentication context with user data and methods
 * @throws Error if used outside AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
