import React, { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import postmanSample from '../../public/assets/SANDBOX_DOCS.json';

interface PostmanImporterProps {
  // onImport: (apis: any[]) => void;
  onImport: (apis: any[], folders?: any[]) => void;
}

interface PostmanCollection {
  info: {
    name: string;
    description?: string;
  };
  item: any[];
  variable?: any[];
  auth?: any;
}

interface PostmanItem {
  name: string;
  item?: any[];
  request?: {
    method: string;
    header?: any[];
    body?: {
      mode: string;
      raw?: string;
      urlencoded?: any[];
      formdata?: any[];
    };
    url?: {
      raw?: string;
      host?: string[];
      path?: string[];
      protocol?: string;
    } | string;
    description?: string | { content?: string } | null;
  };
  response?: any[];
  description?: string | { content?: string } | null;
}

export const PostmanImporter: React.FC<PostmanImporterProps> = ({ onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/json') {
      toast({
        title: "Invalid file type",
        description: "Please upload a JSON file.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const collection: any = JSON.parse(content);

        // console.log('Parsed collection:', collection);

        if (!collection.item || !Array.isArray(collection.item)) {
          throw new Error('Invalid Postman collection format');
        }

        // const apis = parsePostmanCollection(collection);

        const { apis, folders } = parsePostmanCollection(collection);

        // console.log('Parsed APIs:', apis);

        if (apis.length === 0) {
          toast({
            title: "No APIs found",
            description: "The collection doesn't contain any valid API endpoints.",
            variant: "destructive",
          });
          return;
        }

        onImport(apis, folders);


        collection.variable.forEach(item => {

          var postman_data_key = "post-data" + item.key;
          localStorage.setItem(postman_data_key, item.value);
        });

        toast({
          title: "Collection imported successfully",
          description: `Imported ${apis.length} API endpoints from ${collection.info.name}`,
        });
      } catch (error) {
        console.error('Error parsing Postman collection:', error);
        toast({
          title: "Import failed",
          description: "Failed to parse the Postman collection. Please check the file format.",
          variant: "destructive",
        });
      }
    };

    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const parsePostmanCollection = (collection: any): { apis: any[], folders: any[] } => {
    const apis: any[] = [];
    let id = 1;
    const folders: { name: string; path: string; description: string }[] = [];

    const processItems = (items: any[], folderPath: string[] = [], parentFolderInfo?: any) => {
      items.forEach((item) => {
        if (item.request && item.request.method) {
          const method = item.request.method?.toUpperCase() || 'GET';
          let endpoint = '';
          let baseUrl = '';

          if (item.request.url) {
            if (typeof item.request.url === 'string') {
              endpoint = item.request.url;
            } else if (item.request.url?.raw) {
              endpoint = item.request.url.raw;
            } else if (item.request.url?.path) {
              endpoint = '/' + item.request.url.path.join('/');
            }
          }

          if (collection.variable) {

            collection.variable.forEach(item => {

              var postman_data_key = "post-data" + item.key;
              localStorage.setItem(postman_data_key, item.value);
            });

            
            const baseUrlVar = collection.variable.find((v: any) =>
              v.key === 'baseurl-nonprod' || v.key === 'baseUrl' || v.key === 'base_url'
            );
            if (baseUrlVar && baseUrlVar.value) {
              baseUrl = baseUrlVar.value;
            }
          }

          if (endpoint.includes('{{baseurl-nonprod}}') && baseUrl) {
            endpoint = endpoint.replace('{{baseurl-nonprod}}', baseUrl);
          }

          let displayEndpoint = endpoint;
          if (baseUrl && endpoint.startsWith(baseUrl)) {
            displayEndpoint = endpoint.replace(baseUrl, '');
          }

          if (!displayEndpoint.startsWith('/')) {
            displayEndpoint = '/' + displayEndpoint;
          }

          displayEndpoint = displayEndpoint.split('?')[0];

          let description = '';

          if (item.description) {
            if (typeof item.description === 'string') {
              description = item.description;
            } else if (item.description && typeof item.description === 'object' && 'content' in item.description && item.description.content) {
              description = item.description.content;
            }
          }

          if (!description && item.request.description) {
            if (typeof item.request.description === 'string') {
              description = item.request.description;
            } else if (item.request.description && typeof item.request.description === 'object' && 'content' in item.request.description && item.request.description.content) {
              description = item.request.description.content;
            }
          }

          if (!description) {
            description = item.name;
          }

          // const savedConfig = localStorage.getItem('apiTestingConfig');

          // if (savedConfig) {
          //   try {
          //     const parsedConfig = JSON.parse(savedConfig);
          //     setApiConfig(parsedConfig);
          //     // console.log('Loaded config from localStorage:', parsedConfig);
          //   } catch (e) {
          //     console.log('Could not load saved configuration');
          //   }
          // }

          const vars: { key: string; value: string }[] = [];
          const newConfig = { baseUrl: "", transactionVas : "", transactionFrm : "", transactionnonprod : "", transactionswitchnonprod : "", transactionencryptdecryptnonprod : "",tokenization:"",bin:"",tokenize:"",threedsecure:"", bearerToken: "", headers: []};

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
                  cleanedKey.toLowerCase() === "tokenization-nonprod" ||
                  cleanedKey.toLowerCase() === "tokenization"
                ){
                    newConfig.tokenization = value;
                }
                if (
                  cleanedKey.toLowerCase() === "bin" ||
                  cleanedKey.toLowerCase() === "bin"
                ) {
                     newConfig.bin = value;
                }
                if (
                  cleanedKey.toLowerCase() === "tokenize-nonprod" ||
                  cleanedKey.toLowerCase() === "tokenize"
                ) {
                     newConfig.tokenize = value;
                }
                if (
                  cleanedKey.toLowerCase() === "threed-secure" ||
                  cleanedKey.toLowerCase() === "threedsecure"
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

          localStorage.setItem('apiTestingConfig', JSON.stringify(newConfig));



          // let cleanedBody = item.request.body;
          // if (cleanedBody?.raw) {
          //   try {
          //     const cleanedRaw = cleanedBody.raw
          //       .replace(/[\u0000-\u001F\u007F]/g, '')
          //       .replace(/\/\/.*$/gm, '')
          //       .replace(/\/\*[\s\S]*?\*\//g, '')
          //       .replace(/,\s*([}\]])/g, '$1')
          //       .replace(/\\?\"/g, '\\"')
          //       .replace(/\r?\n|\r/g, ' ')
          //       .trim();

          //     try {
          //       JSON.parse(cleanedRaw);
          //       cleanedBody = { ...cleanedBody, raw: cleanedRaw };
          //     } catch (e) {
          //       console.warn(`Still invalid JSON in ${item.name}:`, e.message);
          //     }
          //   } catch (e) {
          //     console.warn(`Could not clean JSON for: ${item.name}`);
          //     console.error('Parse error:', e.message);
          //     console.error('Raw JSON was:', cleanedBody.raw);
          //   }
          // }

          let cleanedBody = item.request.body;

          const api = {
            id: id++,
            method,
            name: item.name,
            endpoint: displayEndpoint,
            description: description || `${method} ${displayEndpoint}`,
            color: getMethodColor(method),
            folderPath: folderPath.length > 0 ? [...folderPath] : [],
            folderInfo: parentFolderInfo,
            postmanData: {
              headers: item.request.header || [],
              body: cleanedBody,
              description: description,
              url: item.request.url,
              fullUrl: endpoint,
              baseUrl: baseUrl
            }
          };

          // console.log('Processing API:', api);
          apis.push(api);
        } else if (item.item && Array.isArray(item.item)) {
          // const newFolderPath = [...folderPath, item.name];
          // const folderInfo = {
          //   name: item.name,
          //   description: item.description
          // };

          const newFolderPath = [...folderPath, item.name];
          const fullPath = newFolderPath.join('/');

          const folderInfo = {
            name: item.name,
            path: fullPath,
            description: typeof item.description === 'string'
              ? item.description
              : item.description?.content || ''
          };
 
          folders.push(folderInfo);

          const vars: { key: string; value: string }[] = [];
          const newConfig = { baseUrl: "", transactionVas : "", transactionFrm : "", transactionnonprod : "", transactionswitchnonprod : "", transactionencryptdecryptnonprod : "",tokenization:"",bin:"",tokenize:"",threedsecure:"", bearerToken: "", headers: []};

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
                if (
                  cleanedKey.toLowerCase() === "tokenization-nonprod" ||
                  cleanedKey.toLowerCase() === "tokenization"
                ) {
                  newConfig.tokenization = value;
                }
                if (
                   cleanedKey.toLowerCase() === "bin" ||
                  cleanedKey.toLowerCase() === "bin"
                ) {
                       newConfig.bin = value;
                }
                if (
                   cleanedKey.toLowerCase() === "tokenize-nonprod" ||
                  cleanedKey.toLowerCase() === "tokenize"
                ) {
                       newConfig.tokenize = value;
                }
                if (
                   cleanedKey.toLowerCase() === "threed-secure" ||
                  cleanedKey.toLowerCase() === "threedsecure"
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

          localStorage.setItem('apiTestingConfig', JSON.stringify(newConfig));

          
          processItems(item.item, newFolderPath, folderInfo);

        }
      });
    };

    processItems(collection.item);

    // return apis;
    return { apis, folders };
  };

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'bg-blue-100 text-blue-800';
      case 'POST':
        return 'bg-green-100 text-green-800';
      case 'PUT':
        return 'bg-orange-100 text-orange-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      case 'PATCH':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const loadSandboxCollection = () => {
    const sampleCollection = {
      "info": {
        "_postman_id": "69531e57-629f-4b7d-9777-4a88d50ab867",
        "name": "SANDBOX DOCS",
        "description": "This Reference Documentation serves as a centralized catalog for all predefined API components that are part of the Onboarding Microservice."
      },
      "item": [
        {
          "name": "INTRODUCTION",
          "item": [
            {
              "name": "X-API KEY",
              "item": [
                {
                  "name": "X-API KEY",
                  "request": {
                    "method": "POST",
                    "header": [],
                    "url": {
                      "raw": "{{baseurl-nonprod}}",
                      "host": ["{{baseurl-nonprod}}"]
                    }
                  },
                  "response": []
                }
              ],
              "description": "An X-API-KEY is a unique identifier issued to API consumers to access protected resources."
            },
            {
              "name": "ENCRYPT",
              "item": [
                {
                  "name": "ENCRYPT",
                  "request": {
                    "method": "POST",
                    "header": [],
                    "url": {
                      "raw": "{{baseurl-nonprod}}",
                      "host": ["{{baseurl-nonprod}}"]
                    }
                  },
                  "response": []
                }
              ],
              "description": "KMS helps securely encrypt and decrypt data using centrally managed cryptographic keys."
            },
            {
              "name": "DECRYPT",
              "item": [
                {
                  "name": "DECRYPT",
                  "request": {
                    "method": "POST",
                    "header": []
                  },
                  "response": []
                }
              ],
              "description": "KMS helps securely encrypt and decrypt data using centrally managed cryptographic keys."
            }
          ]
        }
      ],
      "variable": [
        {
          "key": "baseurl-nonprod",
          "value": "https://onboard-dev.mylapay.com/mylapay/v1/onboarding",
          "type": "string"
        }
      ]
    };

    // const apis = parsePostmanCollection(sampleCollection);

    const { apis, folders } = parsePostmanCollection(sampleCollection);

    onImport(apis, folders);

    toast({
      title: "Sandbox collection loaded",
      description: `Loaded ${apis.length} API endpoints from SANDBOX DOCS`,
    });
  };


  useEffect(() => {
    // const apis = parsePostmanCollection(postmanSample);

    const { apis, folders } = parsePostmanCollection(postmanSample);

    onImport(apis, folders);
  }, []);

  return (

    <></>
    // <div className="space-y-2">
    //   <div className="flex items-center gap-2">
    //     <input
    //       ref={fileInputRef}
    //       type="file"
    //       accept=".json"
    //       onChange={handleFileUpload}
    //       className="hidden"
    //     />
    //     <Button
    //       variant="outline"
    //       size="sm"
    //       onClick={() => fileInputRef.current?.click()}
    //       className="flex items-center gap-2"
    //     >
    //       <Upload size={16} />
    //       Import Collection
    //     </Button>
    //   </div>
      
    //   <Button
    //     variant="ghost"
    //     size="sm"
    //     onClick={loadSandboxCollection}
    //     className="flex items-center gap-2 text-xs"
    //   >
    //     <FileText size={14} />
    //     Load Sandbox Collection
    //   </Button>
    // </div>
  );
};