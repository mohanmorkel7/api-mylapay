import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Search, ArrowRight, Folder, Code, Hash, FileText, ExternalLink } from 'lucide-react';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface SearchResult {
  id: string;
  type: 'endpoint' | 'folder' | 'description' | 'url' | 'parameter';
  title: string;
  subtitle?: string;
  description?: string;
  method?: string;
  endpoint?: string;
  folderPath?: string[];
  originalData?: any;
  matchType: 'exact' | 'partial' | 'fuzzy';
  relevanceScore: number;
}

interface GlobalSearchProps {
  apiEndpoints: any[];
  postmanData: any;
  onNavigate: (result: SearchResult) => void;
  trigger?: React.ReactNode;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  apiEndpoints,
  postmanData,
  onNavigate,
  trigger
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Listen for keyboard shortcut (Ctrl+K or Cmd+K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Build searchable content from all data sources
  const searchableContent = useMemo(() => {
    const content: SearchResult[] = [];
    let idCounter = 0;

    // Extract folder information from postman data
    const extractFolderInfo = (items: any[], parentPath: string[] = []): Map<string, any> => {
      const folderMap = new Map();
      
      items?.forEach(item => {
        if (item.item && Array.isArray(item.item)) {
          // This is a folder
          const currentPath = [...parentPath, item.name];
          const pathKey = currentPath.join('/');
          
          folderMap.set(pathKey, {
            name: item.name,
            description: item.description || '',
            path: currentPath,
            item: item
          });
          
          // Recursively extract subfolders
          const subFolders = extractFolderInfo(item.item, currentPath);
          subFolders.forEach((value, key) => {
            folderMap.set(key, value);
          });
        }
      });
      
      return folderMap;
    };

    const folderMap = postmanData ? extractFolderInfo(postmanData.item || []) : new Map();

    // Add folder results
    folderMap.forEach((folderInfo, pathKey) => {
      content.push({
        id: `folder-${idCounter++}`,
        type: 'folder',
        title: folderInfo.name,
        subtitle: folderInfo.path.join(' > '),
        description: folderInfo.description,
        folderPath: folderInfo.path,
        originalData: folderInfo,
        matchType: 'exact',
        relevanceScore: 0
      });
    });

    // Add API endpoint results
    apiEndpoints.forEach(api => {
      // Main endpoint result
      content.push({
        id: `endpoint-${api.id}`,
        type: 'endpoint',
        title: api.endpoint,
        subtitle: `${api.method} ${api.description}`,
        description: api.description,
        method: api.method,
        endpoint: api.endpoint,
        folderPath: api.folderPath,
        originalData: api,
        matchType: 'exact',
        relevanceScore: 0
      });

      // Add URL parameters as searchable content
      if (api.postmanData?.url) {
        const urlStr = typeof api.postmanData.url === 'string' 
          ? api.postmanData.url 
          : api.postmanData.url.raw || '';
        
        // Extract path parameters
        const pathParams = urlStr.match(/\{([^}]+)\}/g);
        pathParams?.forEach(param => {
          content.push({
            id: `param-${idCounter++}`,
            type: 'parameter',
            title: param,
            subtitle: `Path parameter in ${api.endpoint}`,
            description: `${api.method} ${api.endpoint}`,
            method: api.method,
            endpoint: api.endpoint,
            originalData: api,
            matchType: 'exact',
            relevanceScore: 0
          });
        });

        // Extract query parameters
        if (api.postmanData.url.query) {
          api.postmanData.url.query.forEach((queryParam: any) => {
            content.push({
              id: `query-${idCounter++}`,
              type: 'parameter',
              title: queryParam.key,
              subtitle: `Query parameter in ${api.endpoint}`,
              description: queryParam.description || `${api.method} ${api.endpoint}`,
              method: api.method,
              endpoint: api.endpoint,
              originalData: api,
              matchType: 'exact',
              relevanceScore: 0
            });
          });
        }
      }

      // Add request body fields as searchable content
      if (api.postmanData?.body?.raw) {
        try {
          const bodyJson = JSON.parse(api.postmanData.body.raw);
          const extractFields = (obj: any, prefix = '') => {
            Object.keys(obj).forEach(key => {
              const fullKey = prefix ? `${prefix}.${key}` : key;
              content.push({
                id: `field-${idCounter++}`,
                type: 'parameter',
                title: fullKey,
                subtitle: `Request body field in ${api.endpoint}`,
                description: `${api.method} ${api.endpoint}`,
                method: api.method,
                endpoint: api.endpoint,
                originalData: api,
                matchType: 'exact',
                relevanceScore: 0
              });
              
              if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                extractFields(obj[key], fullKey);
              }
            });
          };
          extractFields(bodyJson);
        } catch (e) {
          // Ignore JSON parse errors
        }
      }

      // Add headers as searchable content
      if (api.postmanData?.headers) {
        api.postmanData.headers.forEach((header: any) => {
          content.push({
            id: `header-${idCounter++}`,
            type: 'parameter',
            title: header.key,
            subtitle: `Header in ${api.endpoint}`,
            description: header.description || `${api.method} ${api.endpoint}`,
            method: api.method,
            endpoint: api.endpoint,
            originalData: api,
            matchType: 'exact',
            relevanceScore: 0
          });
        });
      }
    });

    return content;
  }, [apiEndpoints, postmanData]);

  // Simple fuzzy matching function
  const fuzzyMatch = useCallback((text: string, query: string): boolean => {
    let textIndex = 0;
    let queryIndex = 0;
    
    while (textIndex < text.length && queryIndex < query.length) {
      if (text[textIndex] === query[queryIndex]) {
        queryIndex++;
      }
      textIndex++;
    }
    
    return queryIndex === query.length;
  }, []);

  // Advanced search function with fuzzy matching and relevance scoring
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase().trim();
    const results: SearchResult[] = [];

    searchableContent.forEach(item => {
      const titleLower = item.title.toLowerCase();
      const subtitleLower = (item.subtitle || '').toLowerCase();
      const descriptionLower = (item.description || '').toLowerCase();
      const endpointLower = (item.endpoint || '').toLowerCase();
      const methodLower = (item.method || '').toLowerCase();
      
      let relevanceScore = 0;
      let matchType: 'exact' | 'partial' | 'fuzzy' = 'fuzzy';

      // Exact matches get highest priority
      if (titleLower === query || endpointLower === query || methodLower === query) {
        relevanceScore = 100;
        matchType = 'exact';
      }
      // Starts with query
      else if (titleLower.startsWith(query) || endpointLower.startsWith(query)) {
        relevanceScore = 90;
        matchType = 'partial';
      }
      // Contains query in title/endpoint
      else if (titleLower.includes(query) || endpointLower.includes(query)) {
        relevanceScore = 80;
        matchType = 'partial';
      }
      // Contains query in subtitle
      else if (subtitleLower.includes(query)) {
        relevanceScore = 70;
        matchType = 'partial';
      }
      // Contains query in description
      else if (descriptionLower.includes(query)) {
        relevanceScore = 60;
        matchType = 'partial';
      }
      // Fuzzy match (check if all characters of query exist in order)
      else if (fuzzyMatch(titleLower, query) || fuzzyMatch(endpointLower, query)) {
        relevanceScore = 50;
        matchType = 'fuzzy';
      }
      // Folder path contains query
      else if (item.folderPath?.some(folder => folder.toLowerCase().includes(query))) {
        relevanceScore = 40;
        matchType = 'partial';
      }

      // Boost scores for certain types
      if (relevanceScore > 0) {
        if (item.type === 'endpoint') relevanceScore += 10;
        if (item.type === 'folder') relevanceScore += 5;
        
        results.push({
          ...item,
          matchType,
          relevanceScore
        });
      }
    });

    // Sort by relevance score (descending) and then by type priority
    return results
      .sort((a, b) => {
        if (a.relevanceScore !== b.relevanceScore) {
          return b.relevanceScore - a.relevanceScore;
        }
        
        const typeOrder = { endpoint: 0, folder: 1, parameter: 2, description: 3, url: 4 };
        return typeOrder[a.type] - typeOrder[b.type];
      })
      .slice(0, 50); // Limit results
  }, [searchQuery, searchableContent, fuzzyMatch]);

  const handleSelect = useCallback((result: SearchResult) => {
    setOpen(false);
    setSearchQuery('');
    onNavigate(result);
  }, [onNavigate]);

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'endpoint': return <Code size={16} />;
      case 'folder': return <Folder size={16} />;
      case 'parameter': return <Hash size={16} />;
      case 'description': return <FileText size={16} />;
      case 'url': return <ExternalLink size={16} />;
      default: return <Search size={16} />;
    }
  };

  const getMethodColor = (method?: string) => {
    if (!method) return 'bg-gray-100 text-gray-800';
    switch (method.toUpperCase()) {
      case 'GET': return 'bg-blue-100 text-blue-800';
      case 'POST': return 'bg-green-100 text-green-800';
      case 'PUT': return 'bg-orange-100 text-orange-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      case 'PATCH': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const groupedResults = useMemo(() => {
    const groups: { [key: string]: SearchResult[] } = {
      endpoints: [],
      folders: [],
      parameters: [],
      other: []
    };

    searchResults.forEach(result => {
      switch (result.type) {
        case 'endpoint':
          groups.endpoints.push(result);
          break;
        case 'folder':
          groups.folders.push(result);
          break;
        case 'parameter':
          groups.parameters.push(result);
          break;
        default:
          groups.other.push(result);
      }
    });

    return groups;
  }, [searchResults]);

  return (
    <>
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        <Button
          variant="outline"
          className="relative h-9 w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
          onClick={() => setOpen(true)}
        >
          <Search className="mr-2 h-4 w-4" />
          Search APIs...
          <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      )}

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search endpoints, folders, parameters..."
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {groupedResults.endpoints.length > 0 && (
            <CommandGroup heading="API Endpoints">
              {groupedResults.endpoints.map((result) => (
                <CommandItem
                  key={result.id}
                  onSelect={() => handleSelect(result)}
                  className="flex items-center gap-3 p-3"
                >
                  <div className="flex items-center gap-2">
                    {getResultIcon(result.type)}
                    {result.method && (
                      <Badge className={getMethodColor(result.method)} variant="outline">
                        {result.method}
                      </Badge>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{result.title}</div>
                    {result.subtitle && (
                      <div className="text-xs text-muted-foreground truncate">{result.subtitle}</div>
                    )}
                  </div>
                  <ArrowRight size={14} className="text-muted-foreground" />
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {groupedResults.folders.length > 0 && (
            <CommandGroup heading="Folders">
              {groupedResults.folders.map((result) => (
                <CommandItem
                  key={result.id}
                  onSelect={() => handleSelect(result)}
                  className="flex items-center gap-3 p-3"
                >
                  <div className="flex items-center gap-2">
                    {getResultIcon(result.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{result.title}</div>
                    {result.subtitle && (
                      <div className="text-xs text-muted-foreground truncate">{result.subtitle}</div>
                    )}
                  </div>
                  <ArrowRight size={14} className="text-muted-foreground" />
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {groupedResults.parameters.length > 0 && (
            <CommandGroup heading="Parameters & Fields">
              {groupedResults.parameters.map((result) => (
                <CommandItem
                  key={result.id}
                  onSelect={() => handleSelect(result)}
                  className="flex items-center gap-3 p-3"
                >
                  <div className="flex items-center gap-2">
                    {getResultIcon(result.type)}
                    {result.method && (
                      <Badge className={getMethodColor(result.method)} variant="outline">
                        {result.method}
                      </Badge>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{result.title}</div>
                    {result.subtitle && (
                      <div className="text-xs text-muted-foreground truncate">{result.subtitle}</div>
                    )}
                  </div>
                  <ArrowRight size={14} className="text-muted-foreground" />
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {groupedResults.other.length > 0 && (
            <CommandGroup heading="Other">
              {groupedResults.other.map((result) => (
                <CommandItem
                  key={result.id}
                  onSelect={() => handleSelect(result)}
                  className="flex items-center gap-3 p-3"
                >
                  <div className="flex items-center gap-2">
                    {getResultIcon(result.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{result.title}</div>
                    {result.subtitle && (
                      <div className="text-xs text-muted-foreground truncate">{result.subtitle}</div>
                    )}
                  </div>
                  <ArrowRight size={14} className="text-muted-foreground" />
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
};