import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Folder } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import type { Components } from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

// const getApiDetails = (api: any) => {
//   let finalUrl = '';

//   // 1. Load baseUrl and other values from localStorage
//   let baseUrl = '';
//   let transaction_vas_nonprod = '';
//   let transaction_frm_nonprod = '';
//   let transactionnonprod = '';
//   let transactionswitchnonprod = '';
//   let transactionencryptdecryptnonprod = '';

//   try {
//     const configStr = localStorage.getItem('apiTestingConfig');
//     if (configStr) {
//       const config = JSON.parse(configStr);
//       baseUrl = config.baseUrl || '';
//       transaction_vas_nonprod = config.transactionVas || '';
//       transaction_frm_nonprod = config.transactionFrm || '';
//       transactionnonprod = config.transactionnonprod || '';
//       transactionswitchnonprod = config.transactionswitchnonprod || '';
//       transactionencryptdecryptnonprod = config.transactionencryptdecryptnonprod || '';
//     }
//   } catch (e) {
//     console.warn('Failed to read config from localStorage:', e);
//   }

//   // 2. Postman-style variable replacements
//   const replacements = {
//     'baseurl-nonprod': baseUrl,
//     'transaction-vas-nonprod': transaction_vas_nonprod,
//     'transaction-frm-nonprod': transaction_frm_nonprod,
//     'transaction-nonprod': transactionnonprod,
//     'transaction-switch-nonprod': transactionswitchnonprod,
//     'transaction-encrypt-decrypt-nonprod': transactionencryptdecryptnonprod || '',
//   };

//   const replaceVariables = (str: string, vars: Record<string, string>) =>
//     str.replace(/{{(.*?)}}/g, (_, v) => vars[v.trim()] || '');

//   // 3. Try resolving the URL
//   if (api.postmanData?.url) {
//     try {
//       const url = api.postmanData.url;
//       // console.log('initial url:', url);

//       if (typeof url === 'string') {
//         const replaced = replaceVariables(url, replacements);
//         finalUrl = new URL(replaced.startsWith('http') ? replaced : `https://${replaced}`).href;
//       } else if (url.raw) {
//         const replacedRaw = replaceVariables(url.raw, replacements);
//         finalUrl = new URL(replacedRaw.startsWith('http') ? replacedRaw : `https://${replacedRaw}`).href;
//       } else if (url.host && url.path) {
//         const host = replaceVariables(url.host.join('.'), replacements);
//         const path = replaceVariables(url.path.join('/'), replacements);
//         const protocol = url.protocol ? `${url.protocol}://` : 'https://';
//         finalUrl = `${protocol}${host}/${path}`;
//       }
//       else if (url.raw && typeof url.raw === 'string') {
//         const replacedRaw = replaceVariables(url.raw, replacements);
//         finalUrl = new URL(
//           replacedRaw.startsWith('http') ? replacedRaw : `https://${replacedRaw}`
//         ).href;
//       }
//     } catch (e) {
//       console.warn('Could not parse postmanData.url:', e);
//     }

//     console.log("finalUrl : ", finalUrl);
//   }

//   // console.log('finalUrl before fallback:', finalUrl);

//   // 4. Fallback if unresolved or contains variables
//   if (!finalUrl || finalUrl.includes('{{')) {
//     finalUrl = replaceVariables(api.endpoint, replacements);
//   }

//   // console.log('finalUrl after fallback:', finalUrl);

//   // 5. Combine with endpoint if necessary
//   const cleanedEndpoint = replaceVariables(api.endpoint || '', replacements);
//   const isFullUrl = cleanedEndpoint.startsWith('http://') || cleanedEndpoint.startsWith('https://');

//   // if (cleanedEndpoint) {
//   //   if (isFullUrl) {
//   //     finalUrl = cleanedEndpoint;
//   //   } else if (!finalUrl.endsWith(cleanedEndpoint)) {
//   //     finalUrl = `${finalUrl.replace(/\/+$/, '')}/${cleanedEndpoint.replace(/^\/+/, '')}`;
//   //   }
//   // }

//   // console.log('finalUrl resolved:', finalUrl);

//   // 6. Prepare result with description and parameters
//   const baseDetails = {
//     url: finalUrl,
//     description: api.description || api.postmanData?.description || 'No description',
//   };

//   if (api.postmanData?.body) {
//     const parameters = extractParametersFromPostmanBody(api.postmanData.body);
//     return { ...baseDetails, parameters };
//   }

//   // 7. Optional fallback parameter logic based on endpoint/method
//   switch (api.method) {
//     case 'POST':
//       if (api.endpoint === '/api/users') {
//         return {
//           ...baseDetails,
//           parameters: [
//             { key: 'name', type: 'string', description: 'User full name', required: 'Mandatory', sample: 'John Doe' },
//             { key: 'email', type: 'string', description: 'User email address', required: 'Mandatory', sample: 'john@example.com' },
//             { key: 'phone', type: 'string', description: 'User phone number', required: 'Optional', sample: '+1234567890' },
//             { key: 'role', type: 'string', description: 'User role', required: 'Conditional', sample: 'admin' },
//           ],
//         };
//       }
//       break;

//     case 'PUT':
//       return {
//         ...baseDetails,
//         parameters: [
//           { key: 'name', type: 'string', description: 'Updated user name', required: 'Optional', sample: 'Jane Doe' },
//           { key: 'email', type: 'string', description: 'Updated email', required: 'Optional', sample: 'jane@example.com' },
//           { key: 'phone', type: 'string', description: 'Updated phone', required: 'Optional', sample: '+0987654321' },
//         ],
//       };
//   }

//   return { ...baseDetails, parameters: [] };
// };

// function replaceVariables(str: string, replacements: Record<string, string>) {
//   return str.replace(/{{(.*?)}}/g, (_, key) => replacements[key.trim()] || '');
// }



// Utility to safely replace variables in strings
function replaceVariables(str: string | undefined, vars: Record<string, string>): string {
  return (str ?? '').replace(/{{(.*?)}}/g, (_, v) => vars[v.trim()] || '');
}

export const getApiDetails = (api: any) => {
  let finalUrl = '';

  // 1. Load config from localStorage
  let baseUrl = '';
  let transaction_vas_nonprod = '';
  let transaction_frm_nonprod = '';
  let transactionnonprod = '';
  let transactionswitchnonprod = '';
  let transactionencryptdecryptnonprod = '';
  let tokenization = '';
  let bin = '';
  let threedsecure ='';
  let tokenize = '';
  

  try {
    const configStr = localStorage.getItem('apiTestingConfig');
    if (configStr) {
      const cfg = JSON.parse(configStr);
      baseUrl = cfg.baseUrl || '';
      transaction_vas_nonprod = cfg.transactionVas || '';
      transaction_frm_nonprod = cfg.transactionFrm || '';
      transactionnonprod = cfg.transactionnonprod || '';
      transactionswitchnonprod = cfg.transactionswitchnonprod || '';
      transactionencryptdecryptnonprod = cfg.transactionencryptdecryptnonprod || '';
      tokenization = cfg.tokenization || '';
      bin = cfg.bin || '';
      threedsecure = cfg.threedsecure || '';
      tokenize = cfg.tokenize || '';
    }
  } catch (e) {
    console.warn('Failed to read config:', e);
  }

  const replacements: Record<string, string> = {
    'baseurl-nonprod': baseUrl,
    'transaction-vas-nonprod': transaction_vas_nonprod,
    'transaction-frm-nonprod': transaction_frm_nonprod,
    'transaction-nonprod': transactionnonprod,
    'transaction-switch-nonprod': transactionswitchnonprod,
    'transaction-encrypt-decrypt-nonprod': transactionencryptdecryptnonprod,
    'tokenization-nonprod': tokenization,
    'bin':bin,
    'threed-secure':threedsecure,
    'tokenize-nonprod':tokenize,
  };

  // 2. Try resolving final URL based on Postman data
  const urlObj = api.postmanData?.url;
  if (urlObj) {
    try {
      if (typeof urlObj === 'string') {
        const r = replaceVariables(urlObj, replacements);
        finalUrl = new URL(r.startsWith('http') ? r : `https://${r}`).href;
      } else if (typeof urlObj.raw === 'string') {
        const r = replaceVariables(urlObj.raw, replacements);
        finalUrl = new URL(r.startsWith('http') ? r : `https://${r}`).href;
      } else if (Array.isArray(urlObj.host) && Array.isArray(urlObj.path)) {
        const h = replaceVariables(urlObj.host.join('.'), replacements);
        const p = replaceVariables(urlObj.path.join('/'), replacements);
        const proto = urlObj.protocol ? `${urlObj.protocol}://` : 'https://';
        finalUrl = `${proto}${h}/${p}`;
      }
    } catch (e) {
      console.warn('Could not parse postmanData.url:', e);
    }
  }

  // 3. Fallback to endpoint if URL unresolved or contains leftover variables
  if (!finalUrl || finalUrl.includes('{{')) {
    finalUrl = replaceVariables(api.endpoint, replacements);
  }

  // 4. Build base details
  const baseDetails = {
    url: finalUrl,
    description: api.description || api.postmanData?.description || 'No description',
  };

  // 5. Extract parameters if body exists
  if (api.postmanData?.body) {
    const params = extractParametersFromPostmanBody(api.postmanData.body);
    return { ...baseDetails, parameters: params };
  }

  // 6. Hardcoded sample parameter sets for specific endpoints
  switch (api.method) {
    case 'POST':
      if (api.endpoint === '/api/users') {
        return {
          ...baseDetails,
          parameters: [
            { key: 'name', type: 'string', description: 'User full name', required: 'Mandatory', sample: 'John Doe' },
            { key: 'email', type: 'string', description: 'User email', required: 'Mandatory', sample: 'john@example.com' },
            { key: 'phone', type: 'string', description: 'User phone', required: 'Optional', sample: '+1234567890' },
          ],
        };
      }
      break;
    case 'PUT':
      return {
        ...baseDetails,
        parameters: [
          { key: 'name', type: 'string', description: 'Updated name', required: 'Optional', sample: 'Jane Doe' },
          { key: 'email', type: 'string', description: 'Updated email', required: 'Optional', sample: 'jane@example.com' },
        ],
      };
  }

  // 7. Default return with no parameters
  return { ...baseDetails, parameters: [] };
};




// const extractParametersFromPostmanBody = (body: any): any[] => {
//   const parameters: any[] = [];

//   if (body.mode === 'raw' && body.raw) {
//     try {
//       const jsonBody = JSON.parse(body.raw);
//       Object.keys(jsonBody).forEach(key => {
//         parameters.push({
//           key,
//           type: typeof jsonBody[key],
//           description: `${key} parameter`,
//           required: 'Optional',
//           sample: jsonBody[key]
//         });
//       });
//     } catch (e) {
//       // If it's not JSON, try to parse as form data
//       console.log('Body is not valid JSON');
//     }
//   } else if (body.mode === 'urlencoded' && body.urlencoded) {
//     body.urlencoded.forEach((param: any) => {
//       parameters.push({
//         key: param.key,
//         type: 'string',
//         description: param.description || `${param.key} parameter`,
//         required: param.disabled ? 'Optional' : 'Mandatory',
//         sample: param.value || ''
//       });
//     });
//   } else if (body.mode === 'formdata' && body.formdata) {
//     body.formdata.forEach((param: any) => {
//       parameters.push({
//         key: param.key,
//         type: param.type || 'string',
//         description: param.description || `${param.key} parameter`,
//         required: param.disabled ? 'Optional' : 'Mandatory',
//         sample: param.value || ''
//       });
//     });
//   }

//   return parameters;
// };

const extractParametersFromPostmanBody = (body: any): any[] => {
  const parameters: any[] = [];
  if (!body || !body.mode) return parameters;

  type Requirement = 'Mandatory' | 'Optional' | 'Conditional';

  const toType = (v: any): string => {
    if (Array.isArray(v)) return 'array';
    if (v === null) return 'null';
    return typeof v;
  };

  // Remove // and /* */ comments from JSON while preserving string contents
  const stripJsonComments = (input: string): string => {
    let out = '';
    let inStr = false;
    let quote: string | null = null;
    let inLineComment = false;
    let inBlockComment = false;
    for (let i = 0; i < input.length; i++) {
      const ch = input[i];
      const next = input[i + 1];
      if (inLineComment) {
        if (ch === '\n') {
          inLineComment = false;
          out += ch;
        }
        continue;
      }
      if (inBlockComment) {
        if (ch === '*' && next === '/') {
          inBlockComment = false;
          i++;
        }
        continue;
      }
      if (!inStr && ch === '/' && next === '/') {
        inLineComment = true;
        i++;
        continue;
      }
      if (!inStr && ch === '/' && next === '*') {
        inBlockComment = true;
        i++;
        continue;
      }
      if (inStr) {
        out += ch;
        if (ch === '\\') {
          out += input[++i] ?? '';
          continue;
        }
        if (ch === quote) {
          inStr = false;
          quote = null;
        }
        continue;
      }
      if (ch === '"' || ch === "'") {
        inStr = true;
        quote = ch;
        out += ch;
        continue;
      }
      out += ch;
    }
    return out;
  };

  // Capture per-line requirements from trailing // comments like // mandatory | // conditional | // optional
  const captureRequirementsByLine = (input: string): Record<string, Requirement> => {
    const map: Record<string, Requirement> = {};
    const lines = input.split(/\r?\n/);
    for (const line of lines) {
      // Find comment start outside of simple quoted strings (heuristic)
      let i = 0;
      let inStr = false;
      let quote: string | null = null;
      let commentIdx = -1;
      while (i < line.length) {
        const ch = line[i];
        if (inStr) {
          if (ch === '\\') { i += 2; continue; }
          if (ch === quote) { inStr = false; quote = null; }
          i++; continue;
        }
        if (ch === '"' || ch === "'") { inStr = true; quote = ch; i++; continue; }
        if (ch === '/' && line[i + 1] === '/') { commentIdx = i; break; }
        i++;
      }
      if (commentIdx >= 0) {
        const before = line.slice(0, commentIdx);
        const comment = line.slice(commentIdx + 2).toLowerCase();
        const keyMatch = before.match(/"([^"]+)"\s*:/);
        if (keyMatch) {
          const keyLower = keyMatch[1].trim().toLowerCase();
          if (comment.includes('mandatory')) map[keyLower] = 'Mandatory';
          else if (comment.includes('conditional')) map[keyLower] = 'Conditional';
          else if (comment.includes('optional')) map[keyLower] = 'Optional';
        }
      }
    }
    return map;
  };

  // Recursively flatten objects into dot-notated parameter rows; inherit requirement from parent when not explicitly set on the key
  const flattenToParams = (
    obj: any,
    path: string[] = [],
    inheritedReq?: Requirement,
    reqByKey?: Record<string, Requirement>
  ) => {
    Object.entries(obj).forEach(([k, v]) => {
      const keyPath = [...path, k];
      const leafKeyLower = k.toLowerCase();
      const explicitReq = reqByKey?.[leafKeyLower];
      const required: Requirement = explicitReq || inheritedReq || 'Optional';
      const vType = toType(v);

      if (vType === 'object' && v !== null && !Array.isArray(v)) {
        // Add row for the object itself
        parameters.push({
          key: keyPath.join('.'),
          type: 'object',
          description: keyPath.join('.'),
          required,
          sample: ''
        });
        flattenToParams(v, keyPath, required, reqByKey);
      } else if (Array.isArray(v)) {
        parameters.push({
          key: keyPath.join('.'),
          type: 'array',
          description: keyPath.join('.'),
          required,
          sample: v
        });
        if (v.length > 0 && typeof v[0] === 'object' && v[0] !== null) {
          flattenToParams(v[0], [...keyPath, '[0]'], required, reqByKey);
        }
      } else {
        parameters.push({
          key: keyPath.join('.'),
          type: vType,
          description: keyPath.join('.'),
          required,
          sample: v
        });
      }
    });
  };

  // 1) Raw JSON (with optional comments and requirement markers)
  if (body.mode === 'raw' && typeof body.raw === 'string') {
    const reqByKey = captureRequirementsByLine(body.raw);
    const cleaned = stripJsonComments(body.raw);
    try {
      const jsonBody = JSON.parse(cleaned);
      flattenToParams(jsonBody, [], undefined, reqByKey);
    } catch (e) {
      console.warn('Body is not valid JSON:', e);
    }
  }

  // 2) x-www-form-urlencoded
  if (body.mode === 'urlencoded' && Array.isArray(body.urlencoded)) {
    body.urlencoded.forEach((param: any) => {
      if (!param.key) return;
      parameters.push({
        key: param.key,
        type: 'string',
        description: param.description || `${param.key}`,
        required: param.disabled ? 'Optional' : 'Mandatory',
        sample: param.value || ''
      });
    });
  }

  // 3) form-data
  if (body.mode === 'formdata' && Array.isArray(body.formdata)) {
    body.formdata.forEach((param: any) => {
      if (!param.key) return;

      // Detect inline markers in description like "... //mandatory" or "... // optional"
      let desc = param.description || '';
      let required: Requirement = param.disabled ? 'Optional' : 'Optional';

      if (typeof desc === 'string') {
        const markerMatch = desc.match(/\/\/\s*(mandatory|optional|conditional)/i);
        if (markerMatch) {
          const m = markerMatch[1].toLowerCase();
          if (m === 'mandatory') required = 'Mandatory';
          else if (m === 'conditional') required = 'Conditional';
          else if (m === 'optional') required = 'Optional';

          // Remove the marker from description for display
          desc = desc.replace(/\/\/\s*(mandatory|optional|conditional)/i, '').trim();
        } else {
          // fallback to disabled flag
          required = param.disabled ? 'Optional' : 'Mandatory';
        }
      }

      parameters.push({
        key: param.key,
        type: param.type || 'string',
        description: desc || `${param.key}`,
        required,
        sample: param.value || (param.type === 'file' ? '[file]' : '')
      });
    });
  }

  return parameters;
};


interface ApiDetailViewProps {
  api: any;
}

// export const ApiDetailView: React.FC<ApiDetailViewProps> = ({ api }) => {

//   console.log("api : " , JSON.stringify(api));
//   const details = getApiDetails(api);

  

//   // // If api.item exists, it's a folder → unwrap the first actual API inside it
//   // const normalizedApi = api?.request ? api : (api?.item?.[0]?.request ? {
//   //   ...api.item[0],
//   //   description: api.description || api.item[0].description
//   // } : null);

//   // const details = normalizedApi ? getApiDetails(normalizedApi) : undefined;

//   console.log("details : " , details)

//   return (
    
//     <div>
//       <div className="flex items-center gap-3 mb-6">
//         <Badge className={api.color}>{api.method}</Badge>
//         <h3 className="text-xl font-semibold">{api.description}</h3>
//       </div>

//       <div className="space-y-6">
//         <div>
//           <h4 className="font-semibold mb-2">Endpoint URL</h4>
//           <code className="block bg-gray-100 p-3 rounded text-sm font-mono">
//             {details?.url ?? 'No URL available'}
//           </code>
//         </div>

//         <div>
//           <h4 className="font-semibold mb-2">Description</h4>
//           <p className="text-gray-600">
            
//             {details?.description ?? 'No description available'}
//             </p>
//         </div>


//         {Array.isArray(details?.parameters) && details.parameters.length > 0 && (
//           <div>
//             <h4 className="font-semibold mb-3">Parameters</h4>
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Key</TableHead>
//                   <TableHead>Type</TableHead>
//                   <TableHead>Description</TableHead>
//                   <TableHead>Required</TableHead>
//                   <TableHead>Sample Value</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {details.parameters.map((param, index) => (
//                   <TableRow key={index}>
//                     <TableCell className="font-mono">{param.key}</TableCell>
//                     <TableCell>
//                       <Badge variant="outline">{param.type}</Badge>
//                     </TableCell>
//                     <TableCell>{param.description}</TableCell>
//                     <TableCell>
//                       <Badge 
//                         variant={param.required === 'Mandatory' ? 'destructive' : 
//                                 param.required === 'Optional' ? 'secondary' : 'default'}
//                       >
//                         {param.required}
//                       </Badge>
//                     </TableCell>
//                     {/* <TableCell className="font-mono text-sm">{param.sample}</TableCell> */}

//                     <TableCell className="font-mono text-sm">
//                       {typeof param.sample === 'object'
//                         ? JSON.stringify(param.sample, null, 2)
//                         : param.sample}
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

export const ApiDetailView: React.FC<ApiDetailViewProps> = ({ api }) => {

  const [details, setDetails] = useState<any>(null);

  console.log("deatil view api : ", JSON.stringify(api));

  const normalizedDescription = api.description.replace(/\\`\\`\\`/g, '```');

  useEffect(() => {
    const configStr = localStorage.getItem('apiTestingConfig');
    if (configStr) {
      const details = getApiDetails(api);
      setDetails(details);
      // setApiDetails(apiDetails);
    }
  }, [api]); // or use a state variable if you store config

 function normalizeCodeBlocks(input: string): string {
  return input.replace(/```json\s*([\s\S]*?)```/g, (_, jsonBlock) => {
    try {
      // jsonBlock should be the JSON string inside the ```json ... ```
      const parsed = JSON.parse(jsonBlock.trim());
      const pretty = JSON.stringify(parsed, null, 2);
      return `\`\`\`json\n${pretty}\n\`\`\``;
    } catch (e) {
      // fallback: return original block if parse fails
      return `\`\`\`json\n${jsonBlock}\n\`\`\``;
    }
  });
}

  // Handle folder documentation
  if (api.type === 'folder') {

     console.log("api : ", JSON.stringify(api));

    return (
      <div className="overflow-x-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
              <Folder size={20} className="text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Folder</span>
            </div>
            <div>
              <h3 className="text-2xl font-semibold">{api.name}</h3>
              {api.folderInfo?.item?.length ? (
                <p className="text-sm text-gray-500">{api.folderInfo.item.length} documents</p>
              ) : null}
            </div>
          </div>
          <div className="text-right">
            {/* Optional actions or summary */}
            <span className="text-sm text-gray-500">Documentation</span>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="font-semibold mb-2">Description</h4>
            {/* <div className="text-gray-600 prose prose-sm max-w-none">
              {typeof api.description === 'string' ? (
                <p>{api.description}</p>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: api.description }} />
              )}
            </div> */}

            <div className="prose lg:prose-base max-w-none text-left leading-relaxed text-gray-700">
              <ReactMarkdown
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ node, children, ...props }) => (
            <h1 className="text-3xl font-bold mt-6 mb-3 text-gray-900" {...props}>
              {children}
            </h1>
          ),
          h2: ({ node, children, ...props }) => (
            <h2 className="text-2xl font-semibold mt-5 mb-3 text-gray-800" {...props}>
              {children}
            </h2>
          ),
          h3: ({ node, children, ...props }) => (
            <h3 className="text-lg font-semibold mt-4 mb-2 text-gray-800" {...props}>
              {children}
            </h3>
          ),
          h4: ({ node, children, ...props }) => (
            <h4 className="text-base font-medium mt-3 mb-2 text-gray-800" {...props}>
              {children}
            </h4>
          ),
          p: ({ node, children, ...props }) => (
            <p className="text-base leading-7 whitespace-pre-wrap break-words mb-4 text-gray-700" {...props}>
              {children}
            </p>
          ),
          ul: ({ node, children, ...props }) => (
            <ul className="list-disc list-outside ml-6 mb-4 space-y-1" {...props}>
              {children}
            </ul>
          ),
          ol: ({ node, children, ...props }) => (
            <ol className="list-decimal list-outside ml-6 mb-4 space-y-1" {...props}>
              {children}
            </ol>
          ),
          li: ({ node, children, ...props }) => (
            <li className="mb-2 pl-2 text-gray-700">{children}</li>
          ),
          img: ({ node, ...props }) => (
            <img
              {...props}
              className="my-6 w-full max-w-full h-auto rounded-md shadow-md mx-auto"
              style={{ objectFit: 'contain', maxHeight: '70vh' }}
              alt={props.alt || ''}
            />
          ),
          code: ({ node, children, ...props }) => (
            <code className="bg-gray-100 px-1 py-0.5 rounded text-sm text-red-600" {...props}>
              {children}
            </code>
          ),
          pre: ({ node, children, ...props }) => (
            <pre
              className="bg-gray-100 p-4 rounded text-sm mb-4 shadow-sm break-words whitespace-pre-wrap"
              style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
              {...props}
            >
              {children}
            </pre>
          ),
        }}
      >
        {normalizeCodeBlocks(normalizedDescription)}
      </ReactMarkdown>
            </div>
          </div>

          {/* {api.folderInfo && (
            <div>
              <h4 className="font-semibold mb-2">Folder Information</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                  {JSON.stringify(api.folderInfo, null, 2)}
                </pre>
              </div>
            </div>
          )} */}
        </div>
      </div>
    );
  }


  
 
  // Handle regular API documentation
  // const details = getApiDetails(api);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Badge className={api.color}>{api.method}</Badge>
        <h3 className="text-xl font-semibold">{api.name}</h3>
      </div>

      <div className="space-y-6">
        {details?.url && details.url.trim() !== '' && (
          <div>
            <h4 className="font-semibold mb-2">Endpoint URL</h4>
            <code className="block bg-gray-100 p-3 rounded text-sm font-mono break-all">
              {details.url}
            </code>
          </div>
        )}

        {details?.description && (
          <div>
            <h4 className="font-semibold mb-2">Description</h4>
          

            <div className="prose prose-sm max-w-none text-justify whitespace-pre-wrap break-words text-gray-700 bg-gray-100 rounded-md p-6 overflow-x-hidden">
              <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                      {details.description}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {details?.parameters && details.parameters.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3">Parameters</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Key</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Sample Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {details.parameters.map((param, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono">{param.key}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{param.type}</Badge>
                    </TableCell>
                    <TableCell  >{param.description}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={param.required === 'Mandatory' ? 'destructive' : 
                                param.required === 'Optional' ? 'secondary' : 'default'}
                      >
                        {param.required}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {typeof param.sample === 'object'
                         ? JSON.stringify(param.sample, null, 2)
                         : param.sample}
                     </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};
