import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, Loader2, ShieldCheck, Lock, KeyRound, Ticket, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// API KEY MO
const CUTY_API_KEY = '67e33ac96fe3e5f792747feb8c184f871726dc01'; 
const ADMIN_PASS = 'darman18';

export const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showAdminInput, setShowAdminInput] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  
  // CODE LOGIN STATES
  const [accessCode, setAccessCode] = useState('');
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);

  // ADMIN GENERATOR STATES
  const [generatedCode, setGeneratedCode] = useState('');
  const [duration, setDuration] = useState('24'); // Default 24 hours
  const [isCopied, setIsCopied] = useState(false);

  const { toast } = useToast();

  // --- 1. ADS LOGIN (FREE) ---
  const handleAdsLogin = async () => {
    setIsLoading(true);
    try {
        const currentPageUrl = window.location.origin;
        const returnUrl = `${currentPageUrl}?auth=success`;
        const targetApiUrl = `https://cuty.io/api?api=${CUTY_API_KEY}&url=${encodeURIComponent(returnUrl)}`;
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetApiUrl)}`;

        const response = await fetch(proxyUrl);
        const proxyData = await response.json();

        if (proxyData.contents) {
            const cutyData = JSON.parse(proxyData.contents);
            if (cutyData.shortenedUrl) {
                window.location.href = cutyData.shortenedUrl;
                return;
            }
        }
        throw new Error("Failed to generate link");
    } catch (error) {
        console.error("Login Error:", error);
        toast({ title: "Error", description: "Connection failed.", variant: "destructive" });
        setIsLoading(false);
    }
  };

  // --- 2. CODE LOGIN (PREMIUM) ---
  const handleCodeLogin = async () => {
    if (!accessCode.trim()) return;
    setIsVerifyingCode(true);

    try {
      // Check code in Supabase
      const { data, error } = await supabase
        .from('access_codes')
        .select('*')
        .eq('code', accessCode.trim())
        .eq('is_used', false) // Dapat hindi pa nagamit
        .single();

      if (error || !data) {
        toast({ title: "Invalid Code", description: "Code not found or already used.", variant: "destructive" });
        setIsVerifyingCode(false);
        return;
      }

      // Mark code as used
      await supabase
        .from('access_codes')
        .update({ is_used: true })
        .eq('id', data.id);

      // Set Session Expiry based on code duration
      const expiryTime = Date.now() + (data.duration_hours * 60 * 60 * 1000);
      localStorage.setItem('flame_session_expiry', expiryTime.toString());

      toast({ 
        title: "Access Granted! 🎟️", 
        description: `You have access for ${data.duration_hours} hours.`,
        className: "bg-green-600 text-white border-none" 
      });

      // Reload to enter
      window.location.reload();

    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Verification failed.", variant: "destructive" });
      setIsVerifyingCode(false);
    }
  };

  // --- 3. ADMIN FUNCTIONS ---
  const handleAdminLogin = () => {
    if (adminPassword === ADMIN_PASS) {
        setIsAdminLoggedIn(true);
        toast({ title: "Admin Mode Unlocked", description: "You can now generate codes." });
    } else {
        toast({ title: "Access Denied", variant: "destructive" });
    }
  };

  const generateNewCode = async () => {
    // Generate random string (e.g., "FLAME-X7Z9")
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newCode = `FLAME-${randomStr}`;
    const hours = parseInt(duration);

    const { error } = await supabase
        .from('access_codes')
        .insert([{ code: newCode, duration_hours: hours }]);

    if (error) {
        toast({ title: "Error", description: "Failed to save code.", variant: "destructive" });
    } else {
        setGeneratedCode(newCode);
        toast({ title: "Code Generated!", description: `${newCode} (${hours} hours)` });
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0 opacity-20">
        <img src="https://image.tmdb.org/t/p/original/bQLrHIRneD23x11v4c8zQe1s2t.jpg" alt="bg" className="w-full h-full object-cover grayscale" />
      </div>

      <Card className="w-full max-w-md z-10 shadow-2xl border-primary/20 bg-card/95 backdrop-blur relative">
        
        {/* Hidden Admin Trigger */}
        <div className="absolute top-2 right-2 z-20">
            <Button 
                variant="ghost" size="icon" 
                className="text-muted-foreground/20 hover:text-primary hover:bg-transparent"
                onClick={() => setShowAdminInput(!showAdminInput)}
            >
                <Lock className="w-4 h-4" />
            </Button>
        </div>

        {/* --- VIEW 1: ADMIN PANEL --- */}
        {showAdminInput && isAdminLoggedIn ? (
             <div className="p-6 space-y-4">
                <div className="flex items-center gap-2 mb-4 text-primary">
                    <ShieldCheck /> <h2 className="font-bold text-lg">Admin Code Generator</h2>
                </div>
                
                <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">Duration</label>
                    <select 
                        className="w-full p-2 rounded-md bg-secondary text-sm border border-border"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                    >
                        <option value="12">12 Hours (Trial)</option>
                        <option value="24">24 Hours (1 Day)</option>
                        <option value="168">168 Hours (7 Days)</option>
                        <option value="720">720 Hours (30 Days)</option>
                    </select>
                </div>

                <Button onClick={generateNewCode} className="w-full bg-blue-600 hover:bg-blue-700">
                    Generate Code
                </Button>

                {generatedCode && (
                    <div className="mt-4 p-4 bg-secondary/50 rounded-lg border border-dashed border-primary text-center">
                        <p className="text-xs text-muted-foreground mb-1">Generated Code:</p>
                        <div className="text-2xl font-mono font-bold tracking-wider text-primary mb-2">
                            {generatedCode}
                        </div>
                        <Button size="sm" variant="outline" onClick={copyToClipboard} className="gap-2">
                            {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                            {isCopied ? "Copied!" : "Copy Code"}
                        </Button>
                    </div>
                )}

                <Button variant="ghost" className="w-full text-xs" onClick={() => setShowAdminInput(false)}>
                    Back to Login Screen
                </Button>
             </div>
        ) : showAdminInput ? (
            /* --- VIEW 2: ADMIN LOGIN --- */
             <div className="p-6 space-y-4 animate-in fade-in">
                <h2 className="font-bold text-center">Admin Access</h2>
                <Input 
                    type="password" placeholder="Enter Password" 
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
                />
                <Button className="w-full" onClick={handleAdminLogin}>Unlock</Button>
                <Button variant="link" className="w-full" onClick={() => setShowAdminInput(false)}>Cancel</Button>
             </div>
        ) : (
            /* --- VIEW 3: USER LOGIN (TABS) --- */
            <>
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                        <ShieldCheck className="w-10 h-10 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">FlameIPTV Access</CardTitle>
                    <CardDescription>Choose your login method</CardDescription>
                </CardHeader>

                <CardContent>
                    <Tabs defaultValue="ads" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="ads">Free (Ads)</TabsTrigger>
                            <TabsTrigger value="code">Access Code</TabsTrigger>
                        </TabsList>

                        {/* TAB 1: ADS LOGIN */}
                        <TabsContent value="ads" className="space-y-4">
                            <div className="text-center py-4 space-y-2">
                                <p className="text-sm text-muted-foreground">
                                    Watch a short ad to get <strong>12 Hours</strong> of free access.
                                </p>
                                <Button 
                                    size="lg" 
                                    className="w-full text-lg gap-2 h-12 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 shadow-lg animate-pulse"
                                    onClick={handleAdsLogin}
                                    disabled={isLoading}
                                >
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ExternalLink className="w-5 h-5" />}
                                    {isLoading ? "Generating..." : "Watch Ad & Enter"}
                                </Button>
                            </div>
                        </TabsContent>

                        {/* TAB 2: CODE LOGIN */}
                        <TabsContent value="code" className="space-y-4">
                             <div className="text-center space-y-4 py-2">
                                <p className="text-sm text-muted-foreground">
                                    Have a VIP code? Enter it below.
                                </p>
                                <div className="space-y-2">
                                    <Input 
                                        placeholder="FLAME-XXXXXX" 
                                        className="text-center uppercase font-mono tracking-widest text-lg h-12"
                                        value={accessCode}
                                        onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                                    />
                                    <Button 
                                        size="lg" className="w-full h-12"
                                        onClick={handleCodeLogin}
                                        disabled={isVerifyingCode || !accessCode}
                                    >
                                        {isVerifyingCode ? <Loader2 className="w-5 h-5 animate-spin" /> : <Ticket className="w-5 h-5 mr-2" />}
                                        Redeem Code
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
                <CardFooter className="justify-center">
                    <p className="text-[10px] text-muted-foreground">FlameIPTV • Secure Access</p>
                </CardFooter>
            </>
        )}
      </Card>
    </div>
  );
};
