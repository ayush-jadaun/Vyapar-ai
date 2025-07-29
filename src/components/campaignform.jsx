import { useState } from 'react';
import { Settings, Phone, MessageSquare, Play } from 'lucide-react';

export default function CampaignForm({ contacts, onCampaignCreated }) {
  const [campaignData, setCampaignData] = useState({
    name: '',
    assistantConfig: {
      voice: 'jennifer',
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      firstMessage: 'Hi {{name}}, you have an outstanding balance of ₹{{amount}}. Can you confirm when you\'ll be able to make the payment?'
    }
  });
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (contacts.length === 0) {
      setError('Please upload contacts first');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...campaignData,
          contacts
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        onCampaignCreated(data.campaign);
        setCampaignData({
          name: '',
          assistantConfig: {
            voice: 'jennifer',
            model: 'gpt-3.5-turbo',
            temperature: 0.7,
            firstMessage: 'Hi {{name}}, you have an outstanding balance of ₹{{amount}}. Can you confirm when you\'ll be able to make the payment?'
          }
        });
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError('Error creating campaign: ' + error.message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <Settings className="text-green-600" />
        Campaign Configuration
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Campaign Name
          </label>
          <input
            type="text"
            value={campaignData.name}
            onChange={(e) => setCampaignData({...campaignData, name: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Q4 2024 Debt Collection"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Voice Assistant
            </label>
            <select
              value={campaignData.assistantConfig.voice}
              onChange={(e) => setCampaignData({
                ...campaignData,
                assistantConfig: {...campaignData.assistantConfig, voice: e.target.value}
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="jennifer">Jennifer (Female)</option>
              <option value="william">William (Male)</option>
              <option value="sara">Sara (Female)</option>
              <option value="davis">Davis (Male)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              AI Model
            </label>
            <select
              value={campaignData.assistantConfig.model}
              onChange={(e) => setCampaignData({
                ...campaignData,
                assistantConfig: {...campaignData.assistantConfig, model: e.target.value}
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="gpt-4">GPT-4</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Message Template
          </label>
          <textarea
            value={campaignData.assistantConfig.firstMessage}
            onChange={(e) => setCampaignData({
              ...campaignData,
              assistantConfig: {...campaignData.assistantConfig, firstMessage: e.target.value}
            })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Use {{name}} and {{amount}} placeholders"
          />
          <p className="text-xs text-gray-500 mt-1">
            Use {{name}} and {{amount}} to insert customer data
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">
            <Phone className="inline mr-2" size={16} />
            Ready to call: <span className="font-semibold">{contacts.length} contacts</span>
          </p>
          <p className="text-sm text-gray-600">
            <MessageSquare className="inline mr-2" size={16} />
            Total amount: <span className="font-semibold">₹{contacts.reduce((sum, c) => sum + c.amount, 0).toLocaleString()}</span>
          </p>
        </div>

        {error && (
          <div className="text-red-600 bg-red-50 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isCreating || contacts.length === 0}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {isCreating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Creating Campaign...
            </>
          ) : (
            <>
              <Play size={20} />
              Create Campaign
            </>
          )}
        </button>
      </form>
    </div>
  );
}
