import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, Link, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

// Input validation schema
const channelSchema = z.object({
  name: z.string().trim().min(1, "Channel name is required").max(100, "Name must be 100 characters or less"),
  manifestUri: z.string().trim().min(1, "URL/Manifest URI is required").max(1000, "URL is too long").refine(
    (val) => /^https?:\/\/.+/.test(val),
    "Must be a valid URL starting with http:// or https://"
  ),
  logo: z.string().trim().min(1, "Logo URL is required").max(1000, "URL is too long").refine(
    (val) => /^https?:\/\/.+/.test(val),
    "Must be a valid URL starting with http:// or https://"
  ),
  type: z.enum(['hls', 'mpd', 'youtube']),
  category: z.string().trim().max(50, "Category must be 50 characters or less").optional(),
  clearKey: z.string().trim().max(500, "Clear key is too long").optional()
});

interface ChannelFormData {
  name: string;
  manifestUri: string;
  type: 'mpd' | 'hls' | 'youtube';
  logo: string;
  embedUrl?: string;
  category?: string;
  clearKey?: string; // Input as string, will be converted to Record<string, string>
}

// This matches the Channel interface from channels.ts
interface Channel {
  name: string;
  manifestUri: string;
  clearKey?: Record<string, string>;
  widevineUrl?: string;
  type: 'mpd' | 'hls' | 'youtube';
  logo: string;
  embedUrl?: string;
  category?: string;
  hidden?: boolean;
  youtubeChannelId?: string;
  hasMultipleStreams?: boolean;
}

interface AddChannelFormProps {
  onChannelAdded: () => void;
  username: string;
}

const AddChannelForm = ({ onChannelAdded, username }: AddChannelFormProps) => {
  const [formData, setFormData] = useState<ChannelFormData>({
    name: '',
    manifestUri: '',
    type: 'hls',
    logo: '',
    category: '',
    clearKey: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: keyof ChannelFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'type' && value === 'youtube' ? { embedUrl: prev.manifestUri } : {})
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input
    const validation = channelSchema.safeParse(formData);
    if (!validation.success) {
      const errorMessage = validation.error.errors[0]?.message || "Invalid input";
      toast({
        title: "Validation Error",
        description: errorMessage,
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    const validatedData = validation.data;
    
    // Process YouTube URL to get embed format
    let processedUrl = validatedData.manifestUri;
    let embedUrl = '';
    let youtubeChannelId = '';
    let hasMultipleStreams = false;
    
    if (validatedData.type === 'youtube') {
      // Handle different YouTube URL formats
      if (validatedData.manifestUri.includes('youtube.com/channel/')) {
        youtubeChannelId = validatedData.manifestUri.split('/channel/')[1]?.split('?')[0];
        embedUrl = `https://www.youtube.com/embed/live_stream?channel=${youtubeChannelId}`;
        hasMultipleStreams = true; // Enable multi-stream detection for channel URLs
      } else if (validatedData.manifestUri.includes('embed/live_stream?channel=')) {
        const urlParams = new URLSearchParams(validatedData.manifestUri.split('?')[1]);
        youtubeChannelId = urlParams.get('channel') || '';
        embedUrl = validatedData.manifestUri;
        hasMultipleStreams = true; // Enable multi-stream detection for embed URLs
      } else if (validatedData.manifestUri.includes('youtu.be/') || validatedData.manifestUri.includes('youtube.com/watch')) {
        // For regular YouTube video URLs, use as-is for embed
        embedUrl = validatedData.manifestUri.replace('youtu.be/', 'www.youtube.com/embed/').replace('watch?v=', 'embed/');
        hasMultipleStreams = false; // Individual videos don't have multiple streams
      } else {
        embedUrl = validatedData.manifestUri;
      }
    }

    // Process clearKey for MPD streams
    let processedClearKey: Record<string, string> | undefined = undefined;
    if (validatedData.type === 'mpd' && validatedData.clearKey) {
      try {
        // Try to parse as JSON first
        processedClearKey = JSON.parse(validatedData.clearKey);
      } catch {
        // If not JSON, try to parse as key:value format
        const parts = validatedData.clearKey.split(':');
        if (parts.length === 2) {
          processedClearKey = { [parts[0].trim()]: parts[1].trim() };
        } else {
          toast({
            title: "Invalid Clear Key",
            description: "Clear Key must be in format 'key:value' or valid JSON",
            variant: "destructive"
          });
          setIsSubmitting(false);
          return;
        }
      }
    }

    // Create new channel object that matches Channel interface
    const newChannel: Channel = {
      name: validatedData.name,
      manifestUri: processedUrl,
      type: validatedData.type,
      logo: validatedData.logo,
      category: validatedData.category || 'Custom',
      ...(processedClearKey ? { clearKey: processedClearKey } : {}),
      ...(validatedData.type === 'youtube' ? { 
        embedUrl,
        ...(youtubeChannelId ? { youtubeChannelId } : {}),
        hasMultipleStreams 
      } : {})
    };

    // Save to Supabase
    try {
      const { error } = await supabase
        .from('custom_channels')
        .insert({
          creator_username: username,
          name: newChannel.name,
          manifest_uri: newChannel.manifestUri,
          type: newChannel.type,
          logo: newChannel.logo,
          category: newChannel.category,
          ...(processedClearKey ? { clear_key: processedClearKey } : {}),
          ...(embedUrl ? { embed_url: embedUrl } : {}),
          ...(youtubeChannelId ? { youtube_channel_id: youtubeChannelId } : {}),
          ...(hasMultipleStreams !== undefined ? { has_multiple_streams: hasMultipleStreams } : {})
        });

      if (error) {
        console.error('Error saving channel to Supabase:', error);
        toast({
          title: "Error Adding Channel", 
          description: "Failed to save channel to database. Please try again.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      console.log('Saved channel to Supabase:', newChannel);
      
      if (onChannelAdded) {
        onChannelAdded();
      }
  
      toast({
        title: "Channel Added Successfully!",
        description: `${validatedData.name} has been added and is now visible to everyone!`,
      });
      
      // Reset form
      setFormData({
        name: '',
        manifestUri: '',
        type: 'hls',
        logo: '',
        category: '',
        clearKey: ''
      });
    } catch (error) {
      console.error('Error adding channel:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearForm = () => {
    setFormData({
      name: '',
      manifestUri: '',
      type: 'hls',
      logo: '',
      category: '',
      clearKey: ''
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Custom Channel
        </CardTitle>
        <CardDescription>
          Add your own streaming channels to the platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Channel Name *</Label>
            <Input
              id="name"
              placeholder="My Custom Channel"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Stream Type *</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value) => handleInputChange('type', value as 'mpd' | 'hls' | 'youtube')}
            >
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hls">
                  <div className="flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    <span>HLS (.m3u8)</span>
                  </div>
                </SelectItem>
                <SelectItem value="mpd">
                  <div className="flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    <span>MPD (DASH)</span>
                  </div>
                </SelectItem>
                <SelectItem value="youtube">
                  <div className="flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    <span>YouTube</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="manifestUri">
              {formData.type === 'youtube' ? 'YouTube URL *' : 'Manifest URI / Stream URL *'}
            </Label>
            <Input
              id="manifestUri"
              placeholder={
                formData.type === 'youtube' 
                  ? "https://youtube.com/channel/... or video URL" 
                  : formData.type === 'hls' 
                    ? "https://example.com/stream.m3u8"
                    : "https://example.com/stream.mpd"
              }
              value={formData.manifestUri}
              onChange={(e) => handleInputChange('manifestUri', e.target.value)}
              required
              maxLength={1000}
            />
          </div>

          {formData.type === 'mpd' && (
            <div className="space-y-2">
              <Label htmlFor="clearKey">Clear Key (optional)</Label>
              <Input
                id="clearKey"
                placeholder="keyId:key or JSON format"
                value={formData.clearKey}
                onChange={(e) => handleInputChange('clearKey', e.target.value)}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                Format: keyId:key or {"{"}"keyId": "key"{"}"}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="logo">Logo URL *</Label>
            <Input
              id="logo"
              placeholder="https://example.com/logo.png"
              value={formData.logo}
              onChange={(e) => handleInputChange('logo', e.target.value)}
              required
              maxLength={1000}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category (optional)</Label>
            <Input
              id="category"
              placeholder="Entertainment, News, Sports..."
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              maxLength={50}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              <Plus className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Adding Channel...' : 'Add Channel'}
            </Button>
            <Button type="button" variant="outline" onClick={handleClearForm}>
              Clear Form
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddChannelForm;