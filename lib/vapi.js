import axios from 'axios';

class VapiClient {
  constructor() {
    this.apiKey = process.env.VAPI_API_KEY;
    this.baseURL = 'https://api.vapi.ai';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async createAssistant(config) {
    try {
      const response = await this.client.post('/assistant', {
        model: {
          provider: 'openai',
          model: config.model || 'gpt-3.5-turbo',
          temperature: config.temperature || 0.7,
        },
        voice: {
          provider: 'playht',
          voiceId: config.voice || 'jennifer',
        },
        firstMessage: config.firstMessage,
        systemMessage: `You are a professional debt collection assistant. Be polite, empathetic, and professional. Your goal is to understand when the customer can make their payment. Always summarize their response clearly.`,
        endCallMessage: 'Thank you for your time. We will follow up based on your response.',
      });
      return response.data;
    } catch (error) {
      console.error('Error creating assistant:', error.response?.data || error.message);
      throw error;
    }
  }

  async createCampaign(assistantId, contacts, campaignName) {
    try {
      const contactList = contacts.map(contact => ({
        name: contact.name,
        phoneNumber: contact.phoneNumber,
        variables: {
          name: contact.name,
          amount: contact.amount.toString(),
        },
      }));

      const response = await this.client.post('/campaign', {
        name: campaignName,
        assistantId: assistantId,
        phoneNumberId: 'your-phone-number-id', // You'll need to configure this
        contacts: contactList,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating campaign:', error.response?.data || error.message);
      throw error;
    }
  }

  async getCampaignStatus(campaignId) {
    try {
      const response = await this.client.get(`/campaign/${campaignId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting campaign status:', error.response?.data || error.message);
      throw error;
    }
  }

  async startCampaign(campaignId) {
    try {
      const response = await this.client.post(`/campaign/${campaignId}/start`);
      return response.data;
    } catch (error) {
      console.error('Error starting campaign:', error.response?.data || error.message);
      throw error;
    }
  }
}

export default new VapiClient();