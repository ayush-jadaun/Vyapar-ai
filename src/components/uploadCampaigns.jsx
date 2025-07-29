import { useState } from 'react';
import { Upload, FileText, Users, AlertCircle } from 'lucide-react';

export default function UploadContacts({ onContactsUploaded }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError('');
    setUploadSuccess('');

    try {
      const text = await file.text();
      const response = await fetch('/api/upload/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          csvData: file.type === 'text/csv' ? text : null,
          jsonData: file.type === 'application/json' ? JSON.parse(text) : null
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setUploadSuccess(`Successfully uploaded ${data.total} contacts`);
        onContactsUploaded(data.contacts);
      } else {
        setUploadError(data.error);
      }
    } catch (error) {
      setUploadError('Error processing file: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <Upload className="text-blue-600" />
        Upload Contacts
      </h2>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
        <FileText className="mx-auto text-gray-400 mb-4" size={48} />
        <p className="text-gray-600 mb-4">
          Upload a CSV or JSON file with customer information
        </p>
        <input
          type="file"
          accept=".csv,.json"
          onChange={handleFileUpload}
          disabled={isUploading}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p className="font-semibold mb-2">Required fields:</p>
        <ul className="list-disc list-inside space-y-1">
          <li><code>name</code> - Customer name</li>
          <li><code>phoneNumber</code> - Phone number with country code</li>
          <li><code>amount</code> - Outstanding amount in ₹</li>
        </ul>
      </div>

      {isUploading && (
        <div className="mt-4 flex items-center gap-2 text-blue-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          Processing file...
        </div>
      )}

      {uploadError && (
        <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
          <AlertCircle size={16} />
          {uploadError}
        </div>
      )}

      {uploadSuccess && (
        <div className="mt-4 flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
          <Users size={16} />
          {uploadSuccess}
        </div>
      )}
    </div>
  );
}