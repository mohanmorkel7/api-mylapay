import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { ApiDetailView } from '@/components/ApiDetailView';
import { TestingEnvironment } from '@/components/TestingEnvironment';
import { Card } from '@/components/ui/card';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Book, Code, TestTube, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const defaultApiEndpoints = [
  {
    id: 1,
    method: 'POST',
    endpoint: '/api/users',
    description: 'Create a new user',
    color: 'bg-green-100 text-green-800'
  },
  {
    id: 2,
    method: 'GET',
    endpoint: '/api/users',
    description: 'Get all users',
    color: 'bg-blue-100 text-blue-800'
  },
  {
    id: 3,
    method: 'GET',
    endpoint: '/api/users/{id}',
    description: 'Get user by ID',
    color: 'bg-blue-100 text-blue-800'
  },
  {
    id: 4,
    method: 'PUT',
    endpoint: '/api/users/{id}',
    description: 'Update user',
    color: 'bg-orange-100 text-orange-800'
  },
  {
    id: 5,
    method: 'DELETE',
    endpoint: '/api/users/{id}',
    description: 'Delete user',
    color: 'bg-red-100 text-red-800'
  },
  {
    id: 6,
    method: 'POST',
    endpoint: '/api/auth/login',
    description: 'User authentication',
    color: 'bg-green-100 text-green-800'
  }
];

const features = [
    {
      icon: Book,
      title: 'Comprehensive Documentation',
      description: 'Complete API reference with detailed descriptions and examples'
    },
    {
      icon: Code,
      title: 'Multi-Language Examples',
      description: 'Code examples in cURL, JavaScript, Python, and PHP'
    },
    {
      icon: TestTube,
      title: 'Interactive Testing',
      description: 'Test APIs directly from the documentation with real-time responses'
    },
    {
      icon: Zap,
      title: 'Real-time Responses',
      description: 'See status codes, error messages, and response data instantly'
    }
  ];

const ApiDocs = () => {
  const [selectedApi, setSelectedApi] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [apiEndpoints, setApiEndpoints] = useState(defaultApiEndpoints);
  const [postmanData, setPostmanData] = useState(null);

  const handleSearchNavigation = (result: any) => {
    if (result.type === 'folder') {
      // Navigate to folder documentation
      const folderDoc = {
        id: result.id,
        type: 'folder',
        name: result.title,
        description: result.description,
        folderPath: result.folderPath,
        folderInfo: result.originalData
      };
      setSelectedApi(folderDoc);
    } else if (result.originalData) {
      // Navigate to API endpoint
      setSelectedApi(result.originalData);
    }
  };

  const handleImportApis = (importedApis: any[], folders: any) => {

    console.log('importedApis :', importedApis);

    setApiEndpoints(importedApis);
    setPostmanData(folders);
    setSelectedApi(null);
  };

   const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        apiEndpoints={apiEndpoints}
        postmanData={postmanData}
        onNavigate={handleSearchNavigation}
      />
      <div className="flex">
        <Sidebar 
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          onSelectApi={setSelectedApi}
          selectedApi={selectedApi}
          apiEndpoints={apiEndpoints}
          onImportApis={handleImportApis}
        />
        
        <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'} p-3`}>
          {/* {selectedApi ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              <div>
                <Card className="p-6">
                  <ApiDetailView api={selectedApi} />
                </Card>
              </div>

              
              <div>
                <Card className="p-6">
                  <TestingEnvironment api={selectedApi} postmanData={postmanData} />
                </Card>
              </div>
            </div>
          )
            */}

           {selectedApi ? (
              selectedApi.type === 'folder' ? (
                // Folder selected – show full-width detail view only
                <div>
                  <Card className="p-6">
                    <ApiDetailView api={selectedApi} />
                  </Card>
                </div>
              ) : (
                // API endpoint selected – show detail + testing environment split
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <Card className="p-6">
                      <ApiDetailView api={selectedApi} />
                    </Card>
                  </div>

                  <div>
                    <Card className="p-6">
                      <TestingEnvironment api={selectedApi} postmanData={postmanData} />
                    </Card>
                  </div>
                </div>
              )
            )
          
          : (
            // Original Landing Page content
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                {/* Header */}
                <div className="container mx-auto px-6 py-12">
                  <div className="text-center mb-16">
                    <h1 className="text-5xl font-bold text-gray-900 mb-6">
                      API Documentation
                      <span className="text-blue-600"> & Testing Hub</span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                      Comprehensive API documentation with interactive testing environment. 
                      Explore endpoints, test requests, and view responses all in one place.
                    </p>
                    {/* <Button 
                      onClick={() => navigate('/api-docs')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
                    >
                      Explore API Documentation
                    </Button> */}
                  </div>
          
                  {/* Features Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {features.map((feature, index) => (
                      <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                        <CardHeader className="text-center">
                          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <feature.icon className="w-8 h-8 text-blue-600" />
                          </div>
                          <CardTitle className="text-lg">{feature.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="text-center">
                            {feature.description}
                          </CardDescription>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
          
                  {/* Preview Section */}
                  <Card className="shadow-2xl border-0 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                      <CardTitle className="text-2xl text-center">What You'll Find</CardTitle>
                      <CardDescription className="text-blue-100 text-center">
                        Everything you need to integrate with our APIs
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                          <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-green-600 font-bold">GET</span>
                          </div>
                          <h3 className="font-semibold mb-2">Read Operations</h3>
                          <p className="text-gray-600 text-sm">Fetch user data, retrieve records, and access resources</p>
                        </div>
                        <div className="text-center">
                          <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-blue-600 font-bold">POST</span>
                          </div>
                          <h3 className="font-semibold mb-2">Create Operations</h3>
                          <p className="text-gray-600 text-sm">Add new users, create records, and authenticate</p>
                        </div>
                        <div className="text-center">
                          <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-orange-600 font-bold">PUT</span>
                          </div>
                          <h3 className="font-semibold mb-2">Update & Delete</h3>
                          <p className="text-gray-600 text-sm">Modify existing data and remove resources</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
          
                  {/* CTA Section */}
                  <div className="text-center mt-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Start Testing?</h2>
                    <p className="text-gray-600 mb-8">
                      Jump into our interactive API documentation and start testing endpoints immediately
                    </p>
                    {/* <Button 
                      onClick={() => navigate('/api-docs')}
                      variant="outline"
                      className="border-blue-600 text-red hover:bg-red-600 hover:text-red px-8 py-3"
                    >
                      Start Testing APIs
                    </Button> */}
                  </div>
                </div>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiDocs;