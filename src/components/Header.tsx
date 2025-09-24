import { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Search, Tv, Menu, X } from 'lucide-react';
import { Badge } from './ui/badge';
import { Clock } from './Clock';
import { categories } from '@/data/channels';

interface HeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export const Header = ({ 
  searchTerm, 
  onSearchChange, 
  selectedCategory, 
  onCategoryChange 
}: HeaderProps) => {
  const [showCategories, setShowCategories] = useState(false);

  return (
    <header className="bg-gradient-hero shadow-elegant border-b border-primary/20 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        {/* Main Header Row */}
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-accent p-2 rounded-lg shadow-glow">
              <Tv className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary-foreground">
                flameiptv
              </h1>
              <Clock />
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search channels..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 bg-background/50 border-border/50 focus:bg-background transition-all"
              />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCategories(!showCategories)}
            className="md:hidden text-primary-foreground hover:bg-primary-foreground/10"
          >
            {showCategories ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Categories Row */}
        <div className={`mt-4 ${showCategories ? 'block' : 'hidden md:block'}`}>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className={`cursor-pointer transition-all ${
                  selectedCategory === category
                    ? 'bg-accent text-accent-foreground shadow-glow'
                    : 'bg-background/50 text-foreground hover:bg-accent/20 border-border/50'
                }`}
                onClick={() => {
                  onCategoryChange(category);
                  setShowCategories(false);
                }}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};