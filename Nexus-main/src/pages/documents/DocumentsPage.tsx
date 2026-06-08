import React, { useState, useEffect } from 'react';
import { FileText, Upload, Download, Trash2, Share2, PenTool } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import toast from 'react-hot-toast';

export const DocumentsPage: React.FC = () => {
  const [serverDocs, setServerDocs] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // 1. Fetch live logged-in user documents from backend matching JWT headers
  const pullLiveDocuments = async () => {
    try {
      const savedToken = localStorage.getItem('business_nexus_token') || localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/documents', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': savedToken || '',
          'Authorization': `Bearer ${savedToken}`
        }
      });
      const data = await response.json();
      if (response.ok && data.documents) {
        setServerDocs(data.documents);
      }
    } catch (error) {
      console.error("Error fetching repository files:", error);
    }
  };

  useEffect(() => {
    pullLiveDocuments();
  }, []);

  // 2. Continuous multi-part document processing upload handler simulation
  const handleUploadClick = async () => {
    // Standard prompt trigger to simulate custom file ingestion fields
    const fileName = prompt("Enter file name to upload:", "Startup_Pitch_Deck_v2.pdf");
    if (!fileName) return;

    setIsUploading(true);
    try {
      const savedToken = localStorage.getItem('business_nexus_token') || localStorage.getItem('token');
      
      // Simulating standard Cloud URL file allocation paths
      const fileUrl = `https://amazonaws.com{Date.now()}_${fileName}`;
      const randomSize = `${(Math.random() * 5 + 1).toFixed(1)} MB`;

      const response = await fetch('http://localhost:5000/api/documents/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': savedToken || '',
          'Authorization': `Bearer ${savedToken}`
        },
        body: JSON.stringify({
          fileName,
          fileUrl,
          fileSize: randomSize
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.msg || "Upload handler failure.");

      toast.success(data.msg || "Asset cataloged successfully inside Chamber!");
      pullLiveDocuments(); // Auto-refresh the tracking panel list
    } catch (error: any) {
      toast.error(error.message || "File pipeline exception occurred.");
    } finally {
      setIsUploading(false);
    }
  };

  // 3. Cryptographic E-Signature simulation trigger
  const handleSignDocument = async (docId: string) => {
    const confirmation = window.confirm("Do you want to bind your digital e-signature vector onto this asset catalog profile?");
    if (!confirmation) return;

    try {
      const savedToken = localStorage.getItem('business_nexus_token') || localStorage.getItem('token');
      
      // Mocking drawing canvas base64 URI elements
      const mockBase64Signature = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKAAAABaCAYAAAD...";

      const response = await fetch(`http://localhost:5000/api/documents/sign/${docId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': savedToken || '',
          'Authorization': `Bearer ${savedToken}`
        },
        body: JSON.stringify({
          signatureDataUri: mockBase64Signature
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.msg || "Signing validation breakdown.");

      toast.success(data.msg || "Dynamic e-signature securely bound!");
      pullLiveDocuments(); // Auto-refresh the view layout variables
    } catch (error: any) {
      toast.error(error.message || "E-sign merge matrix failure.");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Processing Chamber</h1>
          <p className="text-gray-600">Secure full-stack environment workspace tracking assets metrics</p>
        </div>
        
        <Button 
          leftIcon={<Upload size={18} />} 
          onClick={handleUploadClick}
          isLoading={isUploading}
        >
          Upload New Document
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Storage info card layout */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">Storage Distribution</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Active Allocated</span>
                <span className="font-medium text-gray-900">{serverDocs.length > 0 ? `${(serverDocs.length * 2.8).toFixed(1)} MB` : '0 MB'}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div 
                  className="h-2 bg-primary-600 rounded-full transition-all duration-500" 
                  style={{ width: serverDocs.length > 0 ? `${Math.min(serverDocs.length * 10, 100)}%` : '0%' }}
                ></div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Free Sandbox Sandbox</span>
                <span className="font-medium text-gray-900">20.0 GB Max</span>
              </div>
            </div>
          </CardBody>
        </Card>
        
        {/* Real-time document rendering logs layout rows */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">All Chamber Ledger Rows</h2>
              <Badge variant="secondary">{serverDocs.length} cataloged</Badge>
            </CardHeader>
            <CardBody>
              {serverDocs.length > 0 ? (
                <div className="space-y-2">
                  {serverDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center p-4 hover:bg-gray-50 rounded-lg border border-gray-100 transition-colors duration-200"
                    >
                      <div className="p-2 bg-primary-50 rounded-lg mr-4">
                        <FileText size={24} className="text-primary-600" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {doc.fileName}
                          </h3>
                          <Badge variant={doc.status === 'Signed & Verified' ? 'success' : 'warning'} size="sm">
                            {doc.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span>{doc.version}</span>
                          <span>{doc.fileSize}</span>
                          <span>Uploaded by: <b className="text-gray-700">{doc.uploadedBy}</b></span>
                        </div>
                      </div>
                      
                      {/* Operational full stack workflow handlers buttons row */}
                      <div className="flex items-center gap-2 ml-4">
                        {doc.status !== 'Signed & Verified' && (
                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<PenTool size={14} />}
                            onClick={() => handleSignDocument(doc.id)}
                            className="text-primary-600 border-primary-200 hover:bg-primary-50"
                          >
                            Sign File
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2"
                          onClick={() => window.open(doc.fileUrl, '_blank')}
                          aria-label="Download"
                        >
                          <Download size={18} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FileText size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="font-medium">Document Chamber is completely empty.</p>
                  <p className="text-sm text-gray-400 mt-1">Click the button above to upload and index custom assets into the repository.</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
