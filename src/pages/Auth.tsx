
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { ArrowRight, Mail, Lock, User, Loader2 } from 'lucide-react';

export default function Auth() {
  const { user, isLoading, signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      className="min-h-screen flex flex-col items-center justify-center bg-theme-dark p-4 transition-all duration-300"
      style={backgroundStyle}
    >
      <div className="mb-10 text-center flex flex-col items-center">
        <div className="mb-4 flex items-center gap-3">
          <img 
            src="/lovable-uploads/bfb01530-83c3-492e-9590-62372077dda7.png" 
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
          <TabsList className="grid w-full grid-cols-2 bg-theme-dark-card rounded-none border-b border-gray-800">
            <TabsTrigger 
              value="signin" 
              className="data-[state=active]:bg-theme-dark-lighter data-[state=active]:text-theme-blue data-[state=active]:border-b-2 data-[state=active]:border-theme-blue rounded-none py-3"
            >
              Sign In
            </TabsTrigger>
            <TabsTrigger 
              value="signup" 
              className="data-[state=active]:bg-theme-dark-lighter data-[state=active]:text-theme-blue data-[state=active]:border-b-2 data-[state=active]:border-theme-blue rounded-none py-3"
            >
              Sign Up
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin" className="mt-0">
            <form onSubmit={handleSignIn}>
              <CardContent className="space-y-6 pt-6">
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
                    className="bg-theme-dark-card border-gray-700 focus:border-theme-blue"
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
                    className="bg-theme-dark-card border-gray-700 focus:border-theme-blue"
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
                    className="bg-theme-dark-card border-gray-700 focus:border-theme-blue"
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
                    className="bg-theme-dark-card border-gray-700 focus:border-theme-blue"
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
    </div>
  );
}
