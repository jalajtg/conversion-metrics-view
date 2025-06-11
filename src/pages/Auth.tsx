
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { ArrowRight, Mail, Lock, User, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Dynamically import PopupChat component
// const PopupChat = lazy(() => import('@/components/PopupChat').then(module => ({ default: module.PopupChat })));

export default function Auth() {
  const { user, isLoading, signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set page title
  useEffect(() => {
    document.title = 'Sign In | Dashboard Platform';
  }, []);

  // Background animation effect
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // If user is already logged in, redirect to dashboard
  if (user && !isLoading) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    try {
      setIsSubmitting(true);
      await signIn(email, password);
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
    } catch (error) {
      console.error('Sign in error:', error);
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) return;
    
    try {
      setIsSubmitting(true);
      await signUp(email, password, name);
      toast({
        title: "Account created",
        description: "Please check your email to verify your account.",
      });
    } catch (error) {
      console.error('Sign up error:', error);
      toast({
        title: "Sign up failed",
        description: "Please check your information and try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsSubmitting(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      toast({
        title: "Google sign in failed",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-theme-dark">
        <div className="animate-pulse-glow">
          <Loader2 className="h-12 w-12 text-theme-blue animate-spin" />
        </div>
      </div>
    );
  }

  const backgroundStyle = {
    backgroundImage: `radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, rgba(59, 130, 246, 0.15) 0%, rgba(18, 18, 18, 0.95) 50%)`,
  };

  return (
    <div 
      className="w-full h-screen flex flex-col items-center justify-center bg-theme-dark p-4 transition-all duration-300"
      style={backgroundStyle}
    >
      <div className="mb-10 text-center flex flex-col items-center">
        <div className="mb-4 flex items-center gap-3">
          <img 
            src="/lovable-uploads/460f8654-9a04-4cac-a568-cd5421a2911e.png" 
            alt="Logo" 
            className="h-12" 
          />
        </div>
        <p className="text-gray-400 max-w-md">Visualize your sales metrics and grow your business</p>
      </div>
      
      <Card className="w-full max-w-md bg-theme-dark-lighter border border-gray-800 shadow-2xl animate-fade-in">
        <div className="p-6 text-center border-b border-gray-800">
          <h2 className="text-2xl font-bold text-white">Welcome</h2>
          <p className="text-gray-400 text-sm mt-1">Sign in to access your dashboard</p>
        </div>
        
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-transparent h-auto p-0 border-b border-gray-800 rounded-none">
            <TabsTrigger 
              value="signin" 
              className="flex-1 py-4 text-gray-400 bg-transparent border-0 rounded-none data-[state=active]:bg-theme-blue/10 data-[state=active]:text-theme-blue data-[state=active]:border-b-2 data-[state=active]:border-theme-blue transition-all duration-200 hover:text-white hover:bg-gray-800/50"
            >
              Sign In
            </TabsTrigger>
            <TabsTrigger 
              value="signup" 
              className="flex-1 py-4 text-gray-400 bg-transparent border-0 rounded-none data-[state=active]:bg-theme-blue/10 data-[state=active]:text-theme-blue data-[state=active]:border-b-2 data-[state=active]:border-theme-blue transition-all duration-200 hover:text-white hover:bg-gray-800/50"
            >
              Sign Up
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin" className="mt-0">
            <form onSubmit={handleSignIn}>
              <CardContent className="space-y-6 pt-6">
                <Button 
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isSubmitting}
                  className="w-full bg-white hover:bg-gray-100 text-gray-900 border border-gray-300 transition-all duration-300"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing in with Google...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continue with Google
                    </span>
                  )}
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-700" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-theme-dark-lighter px-2 text-gray-400">Or continue with</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300 flex items-center gap-2">
                    <Mail size={16} className="text-theme-blue" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-theme-dark-card border-gray-700 focus:border-theme-blue text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-300 flex items-center gap-2">
                    <Lock size={16} className="text-theme-blue" />
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-theme-dark-card border-gray-700 focus:border-theme-blue text-white"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-theme-blue to-theme-blue-dark hover:from-theme-blue-dark hover:to-theme-blue transition-all duration-300"
                  disabled={isSubmitting || !email || !password}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Sign In
                      <ArrowRight size={16} />
                    </span>
                  )}
                </Button>
                <p className="text-xs text-gray-500 text-center">
                  By signing in, you agree to our Terms of Service and Privacy Policy
                </p>
              </CardFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="signup" className="mt-0">
            <form onSubmit={handleSignUp}>
              <CardContent className="space-y-6 pt-6">
                <Button 
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isSubmitting}
                  className="w-full bg-white hover:bg-gray-100 text-gray-900 border border-gray-300 transition-all duration-300"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing up with Google...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continue with Google
                    </span>
                  )}
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-700" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-theme-dark-lighter px-2 text-gray-400">Or continue with</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-gray-300 flex items-center gap-2">
                    <User size={16} className="text-theme-blue" />
                    Full Name
                  </Label>
                  <Input
                    id="signup-name"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="bg-theme-dark-card border-gray-700 focus:border-theme-blue text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-gray-300 flex items-center gap-2">
                    <Mail size={16} className="text-theme-blue" />
                    Email Address
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-theme-dark-card border-gray-700 focus:border-theme-blue text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-gray-300 flex items-center gap-2">
                    <Lock size={16} className="text-theme-blue" />
                    Password
                  </Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-theme-dark-card border-gray-700 focus:border-theme-blue text-white"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-theme-blue to-theme-blue-dark hover:from-theme-blue-dark hover:to-theme-blue transition-all duration-300"
                  disabled={isSubmitting || !email || !password || !name}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating account...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Create Account
                      <ArrowRight size={16} />
                    </span>
                  )}
                </Button>
                <p className="text-xs text-gray-500 text-center">
                  By signing up, you agree to our Terms of Service and Privacy Policy
                </p>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Dynamically loaded PopupChat component */}
      {/* <Suspense fallback={null}>
        <PopupChat />
      </Suspense> */}
    </div>
  );
}
