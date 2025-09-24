import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, Save, X, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';


interface ApiConfigProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: ApiConfiguration) => void;
  currentConfig: ApiConfiguration;
  postmanData?: any; // Add postman data to extract config from
}

export interface ApiConfiguration {
  baseUrl: string;
  bearerToken: string;
  headers: { key: string; value: string }[];
}

export const ApiConfig: React.FC<ApiConfigProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  currentConfig, 
  postmanData 
}) => {
  const [config, setConfig] = useState<ApiConfiguration>(currentConfig);

  const [localStorageVars, setLocalStorageVars] = useState<{ key: string; value: string }[]>([]); 

  useEffect(() => {
    setConfig(currentConfig);
  }, [currentConfig]);

  useEffect(() => {

  const vars: { key: string; value: string }[] = [];
  const newConfig = { baseUrl: "", transactionVas : "", transactionFrm : "", transactionnonprod : "", transactionswitchnonprod : "", transactionencryptdecryptnonprod : "",tokenization:"",bin:"",tokenize:"", threedsecure:"", bearerToken: "", headers: currentConfig.headers || []};

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.includes("post-data")) {
      const value = localStorage.getItem(key);
      if (value) {
        const cleanedKey = key.replace(/^post-(data)?-?/, "");

        vars.push({ key: cleanedKey, value });

        if (
          cleanedKey.toLowerCase() === "baseurl" ||
          cleanedKey.toLowerCase() === "base-url" ||
          cleanedKey.toLowerCase().includes("base")
        ) {
          newConfig.baseUrl = value;
        } if (
          cleanedKey.toLowerCase() === "transaction-frm-nonprod" ||
          cleanedKey.toLowerCase() === "transactionfrmnonprod" ||
          cleanedKey.toLowerCase().includes("frm")
        ) {
          newConfig.transactionFrm = value;
        }
        if (
          cleanedKey.toLowerCase() === "transaction-vas-nonprod" ||
          cleanedKey.toLowerCase() === "transactionvasnonprod" ||
          cleanedKey.toLowerCase().includes("vas")
        ) {
          newConfig.transactionVas = value;
        }
        if (
          cleanedKey.toLowerCase() === "transaction-nonprod" ||
          cleanedKey.toLowerCase() === "transactionnonprod"
        ) {
          newConfig.transactionnonprod = value;
        }
        if (
          cleanedKey.toLowerCase() === "transaction-switch-nonprod" ||
          cleanedKey.toLowerCase() === "transactionswitchnonprod" ||
          cleanedKey.toLowerCase().includes("switch")
        ) {
          newConfig.transactionswitchnonprod = value;
        }
        if (
          cleanedKey.toLowerCase() === "transaction-encrypt-decrypt-nonprod" ||
          cleanedKey.toLowerCase() === "transactionencryptdecryptnonprod"
        ) {
          newConfig.transactionencryptdecryptnonprod = value;
        }
        if(
          cleanedKey.toLocaleLowerCase() === "tokenization-nonprod" ||
          cleanedKey.toLocaleLowerCase() === "tokenization"
        ) {
          newConfig.tokenization = value;
        }
        if (
           cleanedKey.toLocaleLowerCase() === "bin" ||
          cleanedKey.toLocaleLowerCase() === "bin"
        ) {
                    newConfig.bin = value;
        }
        if (
           cleanedKey.toLocaleLowerCase() === "tokenize-nonprod" ||
          cleanedKey.toLocaleLowerCase() === "tokenize"
        ) {
                    newConfig.tokenize = value;
        }
        if (
           cleanedKey.toLocaleLowerCase() === "threed-secure" ||
          cleanedKey.toLocaleLowerCase() === "threedsecure"
        ) {
                    newConfig.threedsecure = value;
        }
        else if (
          cleanedKey.toLowerCase() === "token" ||
          cleanedKey.toLowerCase() === "bearer" ||
          cleanedKey.toLowerCase().includes("bearer-token")
        ) {
          newConfig.bearerToken = value;
        }
      }
    }
  }

  setLocalStorageVars(vars);
  setConfig(newConfig); // ✅ now config is updated correctly
  localStorage.setItem('apiTestingConfig', JSON.stringify(newConfig)); // ✅ saved with updated values
}, []);




  // Extract configuration from Postman collection
  const extractFromPostman = () => {
    if (!postmanData) {
      toast({
        title: "No Postman data",
        description: "Import a Postman collection first to extract configuration.",
        variant: "destructive"
      });
      return;
    }

    let extractedBaseUrl = '';
    let extractedToken = '';
    const extractedHeaders: { key: string; value: string }[] = [];

    // Extract from collection variables if available
    if (postmanData.variable) {
      postmanData.variable.forEach((variable: any) => {
        if (variable.key === 'baseUrl' || variable.key === 'base_url') {
          extractedBaseUrl = variable.value;
        }
        if (variable.key === 'token' || variable.key === 'bearer_token') {
          extractedToken = variable.value;
        }
      });
    }

    // Extract from first request if no collection variables
    if (postmanData.item && postmanData.item.length > 0) {
      const findFirstRequest = (items: any[]): any => {
        for (const item of items) {
          if (item.request) {
            return item.request;
          }
          if (item.item) {
            const found = findFirstRequest(item.item);
            if (found) return found;
          }
        }
        return null;
      };

      const firstRequest = findFirstRequest(postmanData.item);
      
      if (firstRequest) {
        // Extract base URL from first request
        if (firstRequest.url) {
          try {
            let urlString = '';
            if (typeof firstRequest.url === 'string') {
              urlString = firstRequest.url;
            } else if (firstRequest.url.raw) {
              urlString = firstRequest.url.raw;
            } else if (firstRequest.url.protocol && firstRequest.url.host) {
              urlString = `${firstRequest.url.protocol}://${firstRequest.url.host.join('.')}`;
            }
            
            if (urlString && !extractedBaseUrl) {
              const urlObj = new URL(urlString);
              extractedBaseUrl = `${urlObj.protocol}//${urlObj.host}`;
            }
          } catch (e) {
            console.log('Could not parse URL from Postman data');
          }
        }

        // Extract headers and token
        if (firstRequest.header) {
          firstRequest.header.forEach((header: any) => {
            if (header.key && header.value && !header.disabled) {
              if (header.key.toLowerCase() === 'authorization' && header.value.startsWith('Bearer ')) {
                if (!extractedToken) {
                  extractedToken = header.value.replace('Bearer ', '');
                }
              } else if (header.key.toLowerCase() !== 'authorization') {
                extractedHeaders.push({ key: header.key, value: header.value });
              }
            }
          });
        }
      }
    }

    // Update config with extracted values
    setConfig(prev => ({
      baseUrl: extractedBaseUrl || prev.baseUrl,
      bearerToken: extractedToken || prev.bearerToken,
      headers: extractedHeaders.length > 0 ? extractedHeaders : prev.headers
    }));

    toast({
      title: "Configuration extracted",
      description: "Configuration has been extracted from Postman collection.",
    });
  };

  // const addHeader = () => {
  //   setConfig(prev => ({
  //     ...prev,
  //     headers: [...prev.headers, { key: '', value: '' }]
  //   }));
  // };

  // const updateHeader = (index: number, field: 'key' | 'value', value: string) => {
  //   setConfig(prev => ({
  //     ...prev,
  //     headers: prev.headers.map((header, i) => 
  //       i === index ? { ...header, [field]: value } : header
  //     )
  //   }));
  // };

  // const removeHeader = (index: number) => {
  //   setConfig(prev => ({
  //     ...prev,
  //     headers: prev.headers.filter((_, i) => i !== index)
  //   }));
  // };

  const addHeader = () => {
    const updatedHeaders = [...(config.headers || []), { key: '', value: '' }];
    
    const newConfig = { ...config, headers: updatedHeaders };
    setConfig(newConfig);
    persistConfigToLocalStorage(newConfig);
  };

  const updateHeader = (index: number, field: 'key' | 'value', value: string) => {
    const updatedHeaders = [...config.headers];
    updatedHeaders[index][field] = value;

    const newConfig = { ...config, headers: updatedHeaders };
    setConfig(newConfig);
    persistConfigToLocalStorage(newConfig);
  };

  const removeHeader = (index: number) => {
    const updatedHeaders = [...config.headers];
    updatedHeaders.splice(index, 1);

    const newConfig = { ...config, headers: updatedHeaders };
    setConfig(newConfig);
    persistConfigToLocalStorage(newConfig);
  };

  const persistConfigToLocalStorage = (cfg: typeof config) => {

    console.log('headers hcekc :', cfg);


    localStorage.setItem('apiTestingConfig', JSON.stringify(cfg));
  };

  const handleSave = () => {
    onSave(config);
    onClose();
    toast({
      title: "Configuration saved",
      description: "API configuration has been updated successfully.",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings size={20} />
              API Configuration
            </CardTitle>
            <div className="flex items-center gap-2">
              {postmanData && (
                <Button variant="outline" size="sm" onClick={extractFromPostman}>
                  <Download size={16} className="mr-1" />
                  Extract from Postman
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X size={16} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* <div>
            <Label htmlFor="baseUrl">Base URL</Label>
            <Input
              id="baseUrl"
              value={config.baseUrl}
              onChange={(e) => setConfig(prev => ({ ...prev, baseUrl: e.target.value }))}
              placeholder="https://api.example.com"
            />
          </div> */}

          {localStorageVars.map((item, index) => (
            <div key={index}>
              <Label htmlFor={item.key}>{item.key}</Label>
              <Input
                id={item.key}
                value={item.value}
                onChange={(e) => {
                  const newValue = e.target.value;

                  // Update the displayed localStorageVars
                  const updatedVars = [...localStorageVars];
                  updatedVars[index].value = newValue;
                  setLocalStorageVars(updatedVars);

                  // If this is a baseurl-related key, update config.baseUrl too
                  const cleanedKey = item.key.toLowerCase();
                  if (
                    cleanedKey === "baseurl" ||
                    cleanedKey === "base-url" ||
                    cleanedKey.includes("base")
                  ) {
                    setConfig(prev => ({ ...prev, baseUrl: newValue }));
                  }

                  // Optionally update in localStorage too

                  var postman_data_key = "post-data" + item.key;

                  localStorage.setItem(postman_data_key, newValue);
                }}
                className="w-full"
              />
            </div>
          ))}

          <div>
            <Label htmlFor="bearerToken">Bearer Token</Label>
            <Input
              id="bearerToken"
              type="password"
              value={config.bearerToken}
              onChange={(e) => setConfig(prev => ({ ...prev, bearerToken: e.target.value }))}
              placeholder="Your bearer token"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Custom Headers</Label>
              <Button variant="outline" size="sm" onClick={addHeader}>
                Add Header
              </Button>
            </div>
            
            <div className="space-y-3">
              {config.headers.map((header, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    placeholder="Header Key"
                    value={header.key}
                    onChange={(e) => updateHeader(index, 'key', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Header Value"
                    value={header.value}
                    onChange={(e) => updateHeader(index, 'value', e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeHeader(index)}
                  >
                    <X size={16} />
                  </Button>
                </div>
              ))}
              
              {config.headers.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No custom headers configured
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} className="flex-1">
              <Save size={16} className="mr-2" />
              Save Configuration
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};