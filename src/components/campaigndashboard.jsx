import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Phone, CheckCircle, XCircle, Clock, Play, Pause, Users, DollarSign } from 'lucide-react';

export default function CampaignDashboard() {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      const response = await fetch('/api/campaigns');
      const data = await response.json();
      if (data.success) {
        setCampaigns(data.campaigns);
        if (data.campaigns.length > 0) {
          setSelectedCampaign(data.campaigns[0]);
        }
      }
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const startCampaign = async (campaignId) => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/start`, {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        loadCampaigns();
      }
    } catch (error) {
      console.error('Error starting campaign:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Users size={48} className="mx-auto mb-4 opacity-50" />
        <p>No campaigns created yet. Upload contacts and create your first campaign!</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'calling': return 'text-blue-600 bg-blue-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const statusData = selectedCampaign ? [
    { name: 'Completed', value: selectedCampaign.contacts.filter(c => c.callStatus === 'completed').length, color: '#10B981' },
    { name: 'Failed', value: selectedCampaign.contacts.filter(c => c.callStatus === 'failed').length, color: '#EF4444' },
    { name: 'Calling', value: selectedCampaign.contacts.filter(c => c.callStatus === 'calling').length, color: '#3B82F6' },
    { name: 'Pending', value: selectedCampaign.contacts.filter(c => c.callStatus === 'pending').length, color: '#F59E0B' },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Campaign Selector */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Campaign Dashboard</h2>
        <div className="flex flex-wrap gap-4">
          {campaigns.map(campaign => (
            <button
              key={campaign._id}
              onClick={() => setSelectedCampaign(campaign)}
              className={`px-4 py-2 rounded-lg border transition-all ${
                selectedCampaign?._id === campaign._id
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
              }`}
            >
              {campaign.name}
              <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                campaign.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {campaign.status}
              </span>
            </button>
          ))}
        </div>
      </div>

      {selectedCampaign && (
        <>
          {/* Campaign Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Contacts</p>
                  <p className="text-3xl font-bold text-gray-800">{selectedCampaign.contacts.length}</p>
                </div>
                <Users className="text-blue-500" size={40} />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed Calls</p>
                  <p className="text-3xl font-bold text-green-600">
                    {selectedCampaign.contacts.filter(c => c.callStatus === 'completed').length}
                  </p>
                </div>
                <CheckCircle className="text-green-500" size={40} />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Failed Calls</p>
                  <p className="text-3xl font-bold text-red-600">
                    {selectedCampaign.contacts.filter(c => c.callStatus === 'failed').length}
                  </p>
                </div>
                <XCircle className="text-red-500" size={40} />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-3xl font-bold text-purple-600">
                    ₹{selectedCampaign.contacts.reduce((sum, c) => sum + c.amount, 0).toLocaleString()}
                  </p>
                </div>
                <DollarSign className="text-purple-500" size={40} />
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Call Status Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Call Results Overview</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Campaign Controls */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Campaign Controls</h3>
              <div className="flex gap-3">
                {selectedCampaign.status === 'draft' && (
                  <button
                    onClick={() => startCampaign(selectedCampaign._id)}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                  >
                    <Play size={16} />
                    Start Campaign
                  </button>
                )}
                {selectedCampaign.status === 'active' && (
                  <button className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2">
                    <Pause size={16} />
                    Pause Campaign
                  </button>
                )}
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              <p>Status: <span className="font-semibold capitalize">{selectedCampaign.status}</span></p>
              <p>Created: {new Date(selectedCampaign.createdAt).toLocaleDateString()}</p>
              <p>Last Updated: {new Date(selectedCampaign.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Contact List */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Contact Details</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-3 font-semibold">Name</th>
                    <th className="text-left p-3 font-semibold">Phone</th>
                    <th className="text-left p-3 font-semibold">Amount</th>
                    <th className="text-left p-3 font-semibold">Status</th>
                    <th className="text-left p-3 font-semibold">Last Called</th>
                    <th className="text-left p-3 font-semibold">Summary</th>
                    <th className="text-left p-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedCampaign.contacts.map((contact, index) => (
                    <tr key={index} className="border-t hover:bg-gray-50">
                      <td className="p-3 font-medium">{contact.name}</td>
                      <td className="p-3">{contact.phoneNumber}</td>
                      <td className="p-3">₹{contact.amount.toLocaleString()}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contact.callStatus)}`}>
                          {contact.callStatus}
                        </span>
                      </td>
                      <td className="p-3">
                        {contact.lastCalled ? new Date(contact.lastCalled).toLocaleDateString() : '-'}
                      </td>
                      <td className="p-3 max-w-xs">
                        <div className="truncate" title={contact.summary}>
                          {contact.summary || '-'}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          {contact.callStatus === 'failed' && (
                            <button className="text-blue-600 hover:text-blue-800 text-xs">
                              Retry
                            </button>
                          )}
                          {contact.transcript && (
                            <button className="text-green-600 hover:text-green-800 text-xs">
                              View Transcript
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}