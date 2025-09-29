import { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PageViewsProps {
  pagePath?: string;
}

export const PageViews = ({ pagePath = '/' }: PageViewsProps) => {
  const [totalViews, setTotalViews] = useState<number>(0);

  useEffect(() => {
    loadPageViews();
  }, [pagePath]);

  const loadPageViews = async () => {
    try {
      const { count, error } = await supabase
        .from('visits')
        .select('*', { count: 'exact', head: true })
        .eq('page_path', pagePath);

      if (error) {
        console.error('Error loading page views:', error);
        return;
      }

      setTotalViews(count || 0);
    } catch (error) {
      console.error('Error loading page views:', error);
    }
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-secondary/50 rounded-lg">
      <Eye className="w-4 h-4 text-secondary-foreground" />
      <span className="text-sm font-medium">{totalViews.toLocaleString()} Views</span>
    </div>
  );
};