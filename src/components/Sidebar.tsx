import React, { useState, useEffect } from 'react';
import { Menu, X, Folder, FolderOpen, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PostmanImporter } from '@/components/PostmanImporter';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onSelectApi: (api: any) => void;
  selectedApi: any;
  apiEndpoints: any[];
  // onImportApis: (apis: any[], originalPostmanData: any) => void;
  onImportApis: (apis: any[], folders?: any[]) => void; // ✅ Update this
}

interface FolderStructure {
  [key: string]: {
    apis: any[];
    subfolders: FolderStructure;
    folderInfo?: any; // Add folder info support
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed, 
  onToggle, 
  onSelectApi, 
  selectedApi, 
  apiEndpoints, 
  onImportApis
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  

  const toggleFolder = (folderPath: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderPath)) {
      newExpanded.delete(folderPath);
    } else {
      newExpanded.add(folderPath);
    }
    setExpandedFolders(newExpanded);
  };

  const [foldersMeta, setFoldersMeta] = useState<any[]>([]);

   // Handle PostmanImporter callback - it might only pass APIs, so we wrap it
  const handlePostmanImport = (importedData: any,  folderData?: any[]) => {
    // if (Array.isArray(importedData)) {
    //   // If it's just an array of APIs, call with null postman data
    //   onImportApis(importedData, null);
    // } else if (importedData.apis && importedData.postmanData) {
    //   // If it's an object with both APIs and postman data
    //   onImportApis(importedData.apis, importedData.postmanData);
    // } else {
    //   // Fallback - treat as APIs only
    //   onImportApis(importedData, null);
    // }

    setFoldersMeta(folderData || []);  // Save folder descriptions

    console.log('folderData :', folderData);

    onImportApis(importedData, folderData || null);

    // if (Array.isArray(importedData)) {
    //   onImportApis(importedData, null);
    // } else if (importedData.apis && importedData.folders) {
    //   onImportApis(importedData.apis, importedData.folders);
    // } else {
    //   onImportApis(importedData, folderData || null);
    // }
  };

  const extractAllFolders = (structure: FolderStructure, basePath = ''): any[] => {
    let folders: any[] = [];

    Object.entries(structure).forEach(([folderName, folder]) => {
      const folderPath = basePath ? `${basePath}/${folderName}` : folderName;

      folders.push({
        name: folderName,
        path: folderPath,
        description: folder.folderInfo?.description || '',
        folderInfo: folder.folderInfo
      });

      if (Object.keys(folder.subfolders).length > 0) {
        folders = folders.concat(extractAllFolders(folder.subfolders, folderPath));
      }
    });

    return folders;
  };


  //  const buildFolderStructure = (apis: any[]): FolderStructure => {
  //     const structure: FolderStructure = {};

  //     // console.log("api : ", JSON.stringify(apis));

  //     apis.forEach(api => {
  //       if (api.folderPath && api.folderPath.length > 0) {
  //         // Destructure the first folder and the rest of the path
  //         const [folderName, ...restPath] = api.folderPath;

  //         if (!structure[folderName]) {
  //           structure[folderName] = { apis: [], subfolders: {}, folderInfo: api.folderInfo };
  //         }

  //         if (restPath.length === 0) {
  //           // This API belongs directly in this folder
  //           structure[folderName].apis.push(api);
  //         } else {
  //           // Nested deeper — recursively build the subfolder structure with rest of the path
  //           // Clone API with updated folderPath without first segment
  //           const nestedApi = { ...api, folderPath: restPath };

  //           // Recursively build subfolders with only the nested API
  //           const nestedStructure = buildFolderStructure([nestedApi]);

  //           // Merge nestedStructure into current subfolders (handle possible merge)
  //           Object.entries(nestedStructure).forEach(([subFolderName, subFolder]) => {
  //             if (!structure[folderName].subfolders[subFolderName]) {
  //               structure[folderName].subfolders[subFolderName] = subFolder;
  //             } else {
  //               // Merge apis
  //               structure[folderName].subfolders[subFolderName].apis.push(...subFolder.apis);
  //               // Merge subfolders recursively
  //               Object.assign(structure[folderName].subfolders[subFolderName].subfolders, subFolder.subfolders);
  //             }
  //           });
  //         }
  //       } else {
  //         // API at root level
  //         if (!structure['Root']) {
  //           structure['Root'] = { apis: [], subfolders: {} };
  //         }
  //         structure['Root'].apis.push(api);
  //       }
  //     });

  //     return structure;
  //   };

  const buildFolderStructure = (
  apis: any[],
  foldersMeta: any[],
  basePath = ''
): FolderStructure => {
  const structure: FolderStructure = {};

  // First, create all folders from metadata, even if empty
  foldersMeta.forEach(folder => {
    const pathParts = folder.path.split('/');
    let current = structure;
    for (let i = 0; i < pathParts.length; i++) {
      const name = pathParts[i];
      if (!current[name]) {
        current[name] = {
          apis: [],
          subfolders: {},
          folderInfo: i === pathParts.length - 1 ? folder : undefined
        };
      }
      current = current[name].subfolders;
    }
  });

  // Then, assign APIs into the structure
  apis.forEach(api => {
    if (api.folderPath && api.folderPath.length > 0) {
      const [folderName, ...restPath] = api.folderPath;
      const fullPath = api.folderPath.join('/');

      let current = structure;
      for (let i = 0; i < api.folderPath.length; i++) {
        const name = api.folderPath[i];
        if (!current[name]) {
          current[name] = {
            apis: [],
            subfolders: {},
            folderInfo: undefined
          };
        }
        if (i === api.folderPath.length - 1) {
          current[name].apis.push(api);
        }
        current = current[name].subfolders;
      }
    } else {
      if (!structure['Root']) {
        structure['Root'] = { apis: [], subfolders: {} };
      }
      structure['Root'].apis.push(api);
    }
  });

  return structure;
};





  // const handleFolderClick = (folderName: string, folderPath: string, folderInfo: any) => {
  //   // Create a folder documentation object
  //   const folderDoc = {
  //     id: `folder-${folderPath}`,
  //     type: 'folder',
  //     name: folderName,
  //     description: folderInfo?.description || `${folderName} folder documentation`,
  //     folderPath: folderPath,
  //     folderInfo: folderInfo
  //   };
  //   onSelectApi(folderDoc);
  // };

  const handleFolderClick = (folderName: string, folderPath: string, folderInfo: any, foldersList: any[]) => {
    // folderInfo here should be the single folder metadata,
    // foldersList should be the full array of folder info objects
    const folderDoc = {
      id: `folder-${folderPath}`,
      type: 'folder',
      name: folderName,
      description: folderInfo?.description || `${folderName} folder documentation`,
      folderPath: folderPath,
      folderInfo: folderInfo,
      foldersList: foldersList  // <-- include full folder list here
    };
    onSelectApi(folderDoc);
  };

  const renderApiItem = (api: any) => (

    <div
      key={api.id}
      onClick={() => onSelectApi(api)}
      className={`p-1 rounded-lg cursor-pointer transition-colors border ${
        selectedApi?.id === api.id 
          ? 'bg-blue-50 border-blue-200' 
          : 'hover:bg-gray-50 border-transparent hover:border-gray-200'
      } ${collapsed ? 'ml-0' : 'ml-0'}`}
    >
      <div className="flex items-center gap-2 mb-1">
        <Badge className={api.color}>{api.method}</Badge>
        {!collapsed && (
          <span className="text-xs text-gray-600 truncate" title={api.name}>{api.name}</span>
        )}
      </div>
      {/* {!collapsed && (
        <p className="text-xs text-gray-500 mt-1">{api.description}</p>
      )} */}
    </div>
  );

  const renderFolderStructure = (structure: FolderStructure, basePath = '') => {
  return Object.entries(structure).map(([folderName, folder]) => {
    const folderPath = basePath ? `${basePath}/${folderName}` : folderName;
    const isExpanded = expandedFolders.has(folderPath);
    const hasSubfolders = Object.keys(folder.subfolders).length > 0;
    const hasContent = folder.apis.length > 0 || hasSubfolders;
    const isSelected = selectedApi?.type === 'folder' && selectedApi?.folderPath === folderPath;

    return (
      <div key={folderPath} className="mb-1">
        {!collapsed && (
          <div
            className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
              isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
            }`}
          >
            <div
              onClick={() => hasContent && toggleFolder(folderPath)}
              className="flex items-center gap-2 flex-1"
            >
              {hasContent && (
                isExpanded ?
                  <ChevronDown size={16} className="text-gray-500" /> :
                  <ChevronRight size={16} className="text-gray-500" />
              )}
              {isExpanded ?
                <FolderOpen size={16} className="text-blue-600" /> :
                <Folder size={16} className="text-gray-600" />
              }

              <span
                onClick={(e) => {
                  e.stopPropagation();
                  handleFolderClick(folderName, folderPath, folder.folderInfo, allFoldersArray);
                }}
              >
                {folderName}
              </span>
            </div>
          </div>
        )}

        {(isExpanded || collapsed) && hasContent && (
          <div className={collapsed ? "" : "ml-6 space-y-1"}>
            {folder.apis.map(api => renderApiItem(api))}
            {renderFolderStructure(folder.subfolders, folderPath)}
          </div>
        )}
      </div>
    );
  });
};


  // console.log("apiEndpoints : ", apiEndpoints);

  const folderStructure = buildFolderStructure(apiEndpoints, foldersMeta);

  console.log("folderStructure : ", JSON.stringify(folderStructure));

  const allFoldersArray = extractAllFolders(folderStructure);

  

  // Automatically expand the first folder on initial render or when APIs change
  useEffect(() => {
    const folderNames = Object.keys(folderStructure).filter(name => name !== 'Root');
    if (folderNames.length > 0 && expandedFolders.size === 0) {
      const firstFolderPath = folderNames[0];
      setExpandedFolders(new Set([firstFolderPath]));
    }
  }, [apiEndpoints]);

  // console.log("folderStructure : ", folderStructure);

  return (
    <div className="fixed left-0 mt-105 h-full w-64 bg-white border-r border-gray-200 z-50 flex flex-col">
      {/* Header with logo */}
       {/* <div className="flex items-center justify-center py-6 border-b border-gray-200">
        <img
          src="/assets/img/mylapaylogo.png"
          alt="Mylapay Logo"
          className="h-8 w-auto"
        />
      </div>  */}

      {!collapsed && (
        <div >
          <PostmanImporter onImport={handlePostmanImport} />
        </div>
      )}
      
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1">
          {Object.keys(folderStructure).length > 0 ? (
            renderFolderStructure(folderStructure)
          ) : (
            !collapsed && (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No API endpoints loaded</p>
                <p className="text-xs mt-1">Import a Postman collection to get started</p>
              </div>
            )
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
