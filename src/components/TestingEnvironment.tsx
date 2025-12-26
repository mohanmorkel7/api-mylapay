import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Copy, Settings } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ApiConfig, ApiConfiguration } from './ApiConfig';

interface TestingEnvironmentProps {
  api: any;
  postmanData?: any;
}

interface ApiResponse {
  status: number;
  statusText: string;
  data?: any;
  error?: any;
  headers?: { [key: string]: string };
  responseTime?: number;
}

const defaultConfig: ApiConfiguration = {
  baseUrl: '',
  bearerToken: '',
  headers: []
};

export const TestingEnvironment: React.FC<TestingEnvironmentProps> = ({ api, postmanData }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('nodejs');
  const [requestBody, setRequestBody] = useState('');

  const [baseurlmanual, setbaseurlmanual] = useState('');

  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [apiConfig, setApiConfig] = useState<ApiConfiguration>(defaultConfig);
  const [configVersion, setConfigVersion] = useState(0);

  // Load configuration from localStorage on component mount
  useEffect(() => {

    const savedConfig = localStorage.getItem('apiTestingConfig');

    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setApiConfig(parsedConfig);
        // console.log('Loaded config from localStorage:', parsedConfig);
      } catch (e) {
        console.log('Could not load saved configuration');
      }
    }

  }, []);

  // Load request body from API data when available
  useEffect(() => {
    if (api?.postmanData?.body?.raw) {
      setRequestBody(api.postmanData.body.raw);
    } else {
      // Set default body based on API method and endpoint
      const hasBody = ['POST', 'PUT', 'PATCH'].includes(api.method);
      if (hasBody) {
        const sampleBody = api.method === 'POST' && api.endpoint === '/api/users' 
          ? `{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890"
}`
          : api.method === 'POST' && api.endpoint === '/api/auth/login'
          ? `{
  "email": "user@example.com",
  "password": "password123"
}`
          : api.method === 'PUT'
          ? `{
  "name": "Jane Doe",
  "email": "jane@example.com"
}`
          : '{}';
        setRequestBody(sampleBody);
      }
    }

    const configStr = localStorage.getItem('apiTestingConfig');
  const config = configStr ? JSON.parse(configStr) : {};

  const replacements: Record<string, string> = {
    'baseurl-nonprod': config.baseUrl || '',
    'transaction-vas-nonprod': config.transactionVas || '',
    'transaction-frm-nonprod': config.transactionFrm || '',
    'transaction-nonprod': config.transactionnonprod || '',
    'transaction-switch-nonprod': config.transactionswitchnonprod || '',
    'transaction-encrypt-decrypt-nonprod': config.transactionencryptdecryptnonprod || '',
    'tokenization-nonprod':config.tokenization || '' ,
    'bin' : config.bin || '',
    'threed-secure':config.threedsecure || '',
    'tokenize-nonprod':config.tokenize || '',
  };

  if (api?.postmanData?.url?.host) {
    const host = replaceVariables(api.postmanData.url.host.join('.'), replacements);
    // console.log("url.host : ", host);
    setbaseurlmanual(host); // ✅ Safe here
  }


  }, [api]);

  // const getFullUrl = () => {
  //   const baseUrl = apiConfig.baseUrl || 
  //     (api.postmanData?.url ? extractBaseUrl(api.postmanData.url) : 'https://api.example.com');
  //   return `${baseUrl}${api.endpoint}`;
  // };

  // const extractBaseUrl = (url: any): string => {
  //   try {
  //     if (typeof url === 'string') {
  //       const urlObj = new URL(url);
  //       return `${urlObj.protocol}//${urlObj.host}`;
  //     } else if (url.raw) {
  //       const urlObj = new URL(url.raw);
  //       return `${urlObj.protocol}//${urlObj.host}`;
  //     } else if (url.protocol && url.host) {
  //       return `${url.protocol}://${url.host.join('.')}`;
  //     }
  //   } catch (e) {
  //     console.log('Could not parse URL');
  //   }
  //   return 'https://api.example.com';
  // };


  // const getFullUrl = () => {
  //   const baseUrl = apiConfig.baseUrl || 
  //     (api.postmanData?.url ? extractBaseUrl(api.postmanData.url) : 'https://api.example.com');


  //     console.log("api.endpoint : ", api.endpoint);

  //   return `${baseUrl.replace(/\/+$/, '')}/${api.endpoint.replace(/^\/+/, '')}`;
  // };

  // const getFullUrl = () => {
  //   const baseUrl = apiConfig.baseUrl ||
  //     (api.postmanData?.url ? extractBaseUrl(api.postmanData.url) : 'https://api.example.com');

  //   // 🔧 Clean endpoint: remove {{...}} placeholders
  //   const cleanEndpoint = api.endpoint.replace(/{{[^{}]+}}/g, '').replace(/^\/+/, '');

  //   return `${baseUrl.replace(/\/+$/, '')}/${cleanEndpoint}`;
  // };


//   const getFullUrl = () => {
//     const baseUrl = apiConfig.baseUrl ||
//       (api.postmanData?.url ? extractBaseUrl(api.postmanData.url) : 'https://api.example.com');

//     // ✅ Safely clean endpoint only if it exists
//     const rawEndpoint = api?.endpoint || '';
//     const cleanEndpoint = rawEndpoint
//       .replace(/{{[^{}]+}}/g, '')
//       .replace(/^\/+/, '');

//     return `${baseUrl.replace(/\/+$/, '')}/${cleanEndpoint}`;
//   };


//   // const getFullUrl = () => buildFullUrl(api);

//   const extractBaseUrl = (url: any): string => {
//   try {
//     const configStr = localStorage.getItem('apiTestingConfig');
//     const config = configStr ? JSON.parse(configStr) : {};
//     const baseUrlReplacement = config.baseUrl || '';

//     const replacements: Record<string, string> = {
//       'baseurl-nonprod': baseUrlReplacement,
//     };

//     const replaceVariables = (str: string) =>
//       str.replace(/{{(.*?)}}/g, (_, key) => replacements[key.trim()] || '');

//     const sanitizeUrl = (raw: string): string => {
//       const replaced = replaceVariables(raw);

//       // Fix known invalid pattern like onboard-dev.mylapayd.com/{{baseurl-nonprod}}/...
//       const cleaned = replaced.replace(
//         /https?:\/\/[^/]*{{.*?}}[^/]*/g,
//         baseUrlReplacement
//       );

//       try {
//         const urlObj = new URL(cleaned);
//         return `${urlObj.protocol}//${urlObj.host}`;
//       } catch {
//         return baseUrlReplacement || 'https://api.example.com';
//       }
//     };

//     if (typeof url === 'string') return sanitizeUrl(url);
//     if (url.raw) return sanitizeUrl(url.raw);
//     if (url.protocol && url.host) {
//       const hostStr = url.host.map((h: string) => replaceVariables(h)).join('.');
//       return `${url.protocol}://${hostStr}`;
//     }
//   } catch (e) {
//     console.warn('Could not parse URL in extractBaseUrl:', e);
//   }

//   return 'https://api.example.com';
// };



const getFullUrl = () => {
  // const baseUrl =
  //   apiConfig.baseUrl ||
  //   (api.postmanData?.url ? extractBaseUrl(api.postmanData.url.raw) : 'https://api.example.com');

    // const geturl = extractBaseUrl(api.postmanData.url);

    const geturl = api.postmanData?.url ? extractBaseUrl(api.postmanData?.url) : (apiConfig.baseUrl || 'https://api.example.com');

  // console.log("testing final ->>>>>>>>>>>>>>>", geturl);

  const rawEndpoint = api?.endpoint || '';
  const cleanEndpoint = rawEndpoint
    .replace(/{{[^{}]+}}/g, '') // Remove unresolved variables
    .replace(/^\/+/, '');       // Remove leading slashes

  return geturl;
};



// Helper to replace {{variable}} with config values
const replaceVariables = (str: string, vars: Record<string, string>) =>
    str.replace(/{{(.*?)}}/g, (_, v) => vars[v.trim()] || '');

// Extract base URL from Postman-style data
const extractBaseUrl = (url: any): string => {

  let finalUrl = '';

  // console.log('testing initial url:', url);

  try {
    const configStr = localStorage.getItem('apiTestingConfig');
    const config = configStr ? JSON.parse(configStr) : {};

    const replacements: Record<string, string> = {
      'baseurl-nonprod': config.baseUrl || '',
      'transaction-vas-nonprod': config.transactionVas || '',
      'transaction-frm-nonprod': config.transactionFrm || '',
      'transaction-nonprod': config.transactionnonprod || '',
      'transaction-switch-nonprod': config.transactionswitchnonprod || '',
      'transaction-encrypt-decrypt-nonprod': config.transactionencryptdecryptnonprod || '',
      'tokenization-nonprod':config.tokenization || ''  ,
      'bin' : config.bin || '' ,
      'threed-secure':config.threedsecure || '',
      'tokenize-nonprod':config.tokenize || '',
    };


    // 3. Try resolving the URL
  if (url) {
    try {
      // const url = api.postmanData.url;
      

      if (typeof url === 'string') {
        const replaced = replaceVariables(url, replacements);
        finalUrl = new URL(replaced.startsWith('http') ? replaced : `https://${replaced}`).href;
      } else if (url.raw) {
        const replacedRaw = replaceVariables(url.raw, replacements);
        finalUrl = new URL(replacedRaw.startsWith('http') ? replacedRaw : `https://${replacedRaw}`).href;
      } else if (url.host && url.path) {
        const host = replaceVariables(url.host.join('.'), replacements);
        const path = replaceVariables(url.path.join('/'), replacements);
        const protocol = url.protocol ? `${url.protocol}://` : 'https://';
        finalUrl = `${protocol}${host}/${path}`;
      }
    } catch (e) {
      console.warn('Could not parse postmanData.url:', e);
    }
  }

  // console.log('testing finalUrl before fallback:', finalUrl);

  // 4. Fallback if unresolved or contains variables
  if (!finalUrl || finalUrl.includes('{{')) {
    finalUrl = replaceVariables(api.endpoint, replacements);
  }

  // console.log('testing finalUrl after fallback:', finalUrl);

   return finalUrl;

    // const sanitizeUrl = (raw: string): string => {
    //   const replaced = replaceVariables(raw, replacements);
    //   const cleaned = replaced.replace(/https?:\/\/[^/]*{{.*?}}[^/]*/g, replacements['baseurl-nonprod']);

    //   try {
    //     const urlObj = new URL(cleaned.startsWith('http') ? cleaned : `https://${cleaned}`);
    //     return `${urlObj.protocol}//${urlObj.host}`;
    //   } catch {
    //     return replacements['baseurl-nonprod'] || 'https://api.example.com';
    //   }
    // };

    // if (typeof url === 'string') return sanitizeUrl(url);
    // if (url.raw) return sanitizeUrl(url.raw);
    // if (url.protocol && url.host) {
    //   const hostStr = url.host.map((h: string) => replaceVariables(h, replacements)).join('.');
    //   return `${url.protocol}://${hostStr}`;
    // }
  } catch (e) {
    console.warn('Could not parse URL in extractBaseUrl:', e);
  }

  return 'https://api.example.com';
};


  // useEffect(() => {

  //   const headers = api?.postmanData?.headers || [];

  //   console.log("api.postmanData.headers : ", JSON.stringify(headers));

  //   const updatedConfig = { ...apiConfig, headers };
  //   setApiConfig(updatedConfig);

  // }, [apiConfig.bearerToken]); // or other safe trigger


  useEffect(() => {
  if (api?.postmanData?.headers) {
    const headers = api.postmanData.headers;

    console.log("api.postmanData.headers : ", JSON.stringify(headers));

    setApiConfig(prev => ({
      ...prev,
      headers
    }));
  }
}, [api?.postmanData?.headers]);


  const buildHeaders = (): HeadersInit => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // console.log("api.postmanData : ", api.postmanData);
    // console.log("api.postmanData.headers : ", api.postmanData.headers);

    // console.log("apiConfig.bearerToken : ", apiConfig.bearerToken)
    // Add bearer token if configured
    if (apiConfig.bearerToken) {
      headers['Authorization'] = `Bearer ${apiConfig.bearerToken}`;
      // console.log('Adding bearer token to headers:', apiConfig.bearerToken);
    }

    // Add custom headers
    apiConfig.headers.forEach(header => {
      if (header.key && header.value) {
        headers[header.key] = header.value;
      }
    });

    // // Add headers from Postman data
    // if (api.postmanData?.headers) {
    //   api.postmanData.headers.forEach((header: any) => {
    //     if (header.key && header.value && !header.disabled) {
    //       headers[header.key] = header.value;
    //     }
    //   });
    // }
    return headers;
  };

  const getCodeExample = (language: string) => {
    const fullUrl = getFullUrl();
    const hasBody = ['POST', 'PUT', 'PATCH'].includes(api.method);

    const headers = buildHeaders(); // ✅ unified


    // const headers = apiConfig.headers;

    // console.log('apiConfig for add header : ', JSON.stringify(apiConfig));


    // // Convert it into array format { key: string, value: string }[]
    // const newHeaders = Object.entries(headers).map(([key, value]) => ({
    //   key,
    //   value
    // }));

    // // Update the config
    // const updatedConfig = {
    //   ...apiConfig,
    //   headers: newHeaders
    // };

    // setApiConfig(updatedConfig);



    // setApiConfig(parsedConfig);

    // console.log('headers :', JSON.stringify(headers));

    // prepare form-data if the Postman body provides it
    const postmanBody = api.postmanData?.body;
    const isFormData = postmanBody?.mode === 'formdata' && Array.isArray(postmanBody?.formdata);
    const formEntries: { key: string; value: string }[] = [];
    if (isFormData) {
      postmanBody.formdata.forEach((p: any) => {
        if (p && p.key) formEntries.push({ key: p.key, value: p.value ?? '' });
      });
    }

    switch (language) {
  case 'curl':
    let curlCommand = "";

    if(api.method != undefined) {
      curlCommand = `curl -X ${api.method} \\\n  "${fullUrl}"`;
    } else {
      curlCommand = `curl -X \\\n  "${fullUrl}"`;
    }

    Object.entries(headers).forEach(([key, value]) => {
      curlCommand += ` \\\n  -H "${key}: ${value}"`;
    });

    if (isFormData && formEntries.length > 0) {
      formEntries.forEach(fe => {
        curlCommand += ` \\\n  -F "${fe.key}=${fe.value}"`;
      });
    } else if (hasBody && requestBody) {
      curlCommand += ` \\\n  -d '${requestBody}'`;
    }

    return curlCommand;

  case 'javascript':
    if (isFormData && formEntries.length > 0) {
      // Build JS FormData example
      const formLines = formEntries.map(f => `fd.append('${f.key}', '${f.value}');`).join('\n');
      return `const fd = new FormData();\n${formLines}\n\nfetch('${fullUrl}', {\n  method: '${api.method}',\n  body: fd\n})\n  .then(res => res.json())\n  .then(data => console.log(data));`;
    }

    const headersObj = Object.entries(headers)
      .map(([key, value]) => `    '${key}': '${value}'`)
      .join(',\n');

    return `fetch('${fullUrl}', {\n  method: '${api.method}',\n  headers: {\n${headersObj}\n  }${hasBody && requestBody ? `,\n  body: \`${requestBody}\`` : ''}\n})\n.then(response => response.json())\n.then(data => console.log(data))\n.catch(error => console.error('Error:', error));`;

  case 'python':
    if (isFormData && formEntries.length > 0) {
      const formLines = formEntries.map(f => `(${JSON.stringify(f.key)}, ${JSON.stringify(f.value)})`).join(',\n  ');
      return `import requests

url = "${fullUrl}"

form_data = [
  ${formLines}
]

response = requests.${api.method.toLowerCase()}(url, files=dict(form_data))
print('Status:', response.status_code)
print(response.text)`;
    }

    const pythonHeaders = Object.entries(headers)
      .map(([key, value]) => `    "${key}": "${value}"`)
      .join(',\n');

    return `import requests
import json

url = "${fullUrl}"
headers = {
${pythonHeaders}
}
${hasBody && requestBody ? `
data = \`${requestBody}\`

response = requests.${api.method.toLowerCase()}(url, headers=headers, data=data)` : `
response = requests.${api.method.toLowerCase()}(url, headers=headers)`}
print(f"Status: {response.status_code}")
print(response.json())`;

  case 'php':
    if (isFormData && formEntries.length > 0) {
      const formLines = formEntries.map(f => ` ${JSON.stringify(f.key)} => ${JSON.stringify(f.value)}`).join(',\n');
      return `<?php
$url = "${fullUrl}";
$form = [
${formLines}
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "${api.method}");
curl_setopt($ch, CURLOPT_POSTFIELDS, $form);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Status: " . $httpCode . "\n";
echo $response;
?>`;
    }
    const phpHeaders = Object.entries(headers)
      .map(([key, value]) => `    "${key}: ${value}"`)
      .join(',\n');

    return `<?php
$url = "${fullUrl}";
$headers = [
${phpHeaders}
];
${hasBody && requestBody ? `
$data = \`${requestBody}\`;

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "${api.method}");
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);` : `
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "${api.method}");`}
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Status: " . $httpCode . "\\n";
echo $response;
?>`;

  case 'nodejs':
  if (isFormData && formEntries.length > 0) {
    const formLines = formEntries.map(f => `fd.append('${f.key}', '${f.value}');`).join('\n');
    return `const FormData = require('form-data');\nconst fd = new FormData();\n${formLines}\n\nfetch('${fullUrl}', {\n  method: '${api.method}',\n  body: fd\n})\n.then(res => res.json())\n.then(data => console.log(data));`;
  }
  const nodeHeaders = Object.entries(headers)
    .map(([key, value]) => `    '${key}': '${value}'`)
    .join(',\n');

  return `// Requires Node.js v18+ for native fetch support
const fetch = require('node-fetch');

const url = '${fullUrl}';

fetch(url, {
  method: '${api.method}',
  headers: {
${nodeHeaders}
  }${hasBody && requestBody ? `,
  body: \`${requestBody}\`` : ''}
})
  .then(response => {
    console.log('Status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('Response:', data);
  })
  .catch(error => {
    console.error('Error:', error);
  });`;

  default:
    return '';
}

  };

  const handleTest = async () => {
    setIsLoading(true);
    const startTime = Date.now();
    
    try {
      const fullUrl = getFullUrl();
      const headers = buildHeaders();
      const hasBody = ['POST', 'PUT', 'PATCH'].includes(api.method);
      
      // console.log('Making API request to:', fullUrl);
      // console.log('Headers:', headers);
      // console.log('Body:', hasBody ? requestBody : 'No body');
      // console.log('Current config:', apiConfig);
      
      const fetchOptions: RequestInit = {
        method: api.method,
        headers,
      };
      
      if (hasBody && requestBody) {
        fetchOptions.body = requestBody;
      }
      
      const response = await fetch(fullUrl, fetchOptions);
      const responseTime = Date.now() - startTime;
      
      let responseData;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }
      
      // Extract response headers
      const responseHeaders: { [key: string]: string } = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });
      
      setResponse({
        status: response.status,
        statusText: response.statusText,
        data: responseData,
        headers: responseHeaders,
        responseTime
      });
      
    } catch (error) {
      console.error('API request failed:', error);
      setResponse({
        status: 0,
        statusText: 'Network Error',
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          type: 'NetworkError'
        },
        responseTime: Date.now() - startTime
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Code example has been copied to your clipboard.",
    });
  };

  const handleConfigSave = (config: ApiConfiguration) => {
    setApiConfig(config);
    setConfigVersion(prev => prev + 1); // Force re-render
    localStorage.setItem('apiTestingConfig', JSON.stringify(config));
    localStorage.setItem('post-datatoken', config.bearerToken);

    // console.log('Saved new config:', config);
  };

  return (
    <div className="space-y-6" key={configVersion}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">API Testing Environment</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowConfig(true)}
          >
            <Settings size={16} className="mr-1" />
            Config
          </Button>
          <Badge className={api.color}>{api.method}</Badge>
        </div>
      </div>

      {/* Display current config status */}
      <div className="bg-gray-50 p-3 rounded-lg text-sm">
        <div className="flex items-center gap-2">
          <span className="font-medium flex-shrink-0">Base URL:</span>
          <span className="font-mono text-gray-600 whitespace-normal break-all" title={baseurlmanual || ''}>
            {baseurlmanual || 'Not configured'}
          </span>
        </div>
        {/* <div className="flex items-center justify-between mt-1">
          <span className="font-medium">Bearer Token:</span>
          <span className="font-mono text-gray-600">
            {apiConfig.bearerToken ? '••••••••' : 'Not configured'}
          </span>
        </div> */}
      </div>

      <Tabs defaultValue="request" className="w-full" 
        onValueChange={(value) => {
          if (value === 'response') {
            handleTest();
          }
        }}
        
        >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="request">Request</TabsTrigger>
          <TabsTrigger value="response">Response</TabsTrigger>
        </TabsList>

        <TabsContent value="request" className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">URL</label>
            <div className="bg-gray-100 p-3 rounded text-sm font-mono break-all">
              {getFullUrl()}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Language</label>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nodejs">Node.js</SelectItem>
                <SelectItem value="curl">cURL</SelectItem>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="php">PHP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Code Example</label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(getCodeExample(selectedLanguage))}
              >
                <Copy size={16} className="mr-1" />
                Copy
              </Button>
            </div>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
              <code>{getCodeExample(selectedLanguage)}</code>
            </pre>
          </div>

          {['POST', 'PUT', 'PATCH'].includes(api.method) && (
            <div>
              <label className="block text-sm font-medium mb-2">Request Body (JSON)</label>
              <Textarea
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                placeholder="Enter your JSON request body here..."
                className="font-mono text-sm"
                rows={8}
              />
            </div>
          )}

          <Button onClick={handleTest} disabled={isLoading} className="w-full">
            <Play size={16} className="mr-2" />
            {isLoading ? 'Testing...' : 'Test API'}
          </Button>
        </TabsContent>

        <TabsContent value="response">
          {response ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>Response</span>
                  <Badge 
                    variant={response.status >= 200 && response.status < 300 ? 'default' : 'destructive'}
                    className={response.status >= 200 && response.status < 300 ? 'bg-green-100 text-green-800' : ''}
                  >
                    {response.status} {response.statusText}
                  </Badge>
                  {response.responseTime && (
                    <Badge variant="secondary">
                      {response.responseTime}ms
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Response Body</h4>
                    <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto max-h-96">
                      <code>{JSON.stringify(response.data || response.error, null, 2)}</code>
                    </pre>
                  </div>

                  {response.headers && Object.keys(response.headers).length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Response Headers</h4>
                      <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto max-h-48">
                        <code>{JSON.stringify(response.headers, null, 2)}</code>
                      </pre>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium mb-2">Status Code Reference</h4>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800">2xx</Badge>
                        <span>Success - Request completed successfully</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive">4xx</Badge>
                        <span>Client Error - Invalid request or unauthorized</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive">5xx</Badge>
                        <span>Server Error - Internal server error</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Click "Test API" to see the response here</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <ApiConfig
        isOpen={showConfig}
        onClose={() => setShowConfig(false)}
        onSave={handleConfigSave}
        currentConfig={apiConfig}
        postmanData={postmanData}
      />
    </div>
  );
};
