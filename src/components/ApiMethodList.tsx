
import React from 'react';
import { Badge } from '@/components/ui/badge';

const apiMethods = [
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

interface ApiMethodListProps {
  onSelectApi: (api: any) => void;
  selectedApi: any;
}

export const ApiMethodList: React.FC<ApiMethodListProps> = ({ onSelectApi, selectedApi }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">API Endpoints</h3>
      <div className="space-y-2">
        {apiMethods.map((api) => (
          <div
            key={api.id}
            onClick={() => onSelectApi(api)}
            className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
              selectedApi?.id === api.id 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Badge className={api.color}>{api.method}</Badge>
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">{api.endpoint}</code>
            </div>
            <p className="text-sm text-gray-600">{api.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
