import dbConnect from './../../../../lib/db.js';
import Campaign from './../../../../models/campaign.js';
import vapiClient from './../../../../lib/vapi.js';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const campaigns = await Campaign.find().sort({ createdAt: -1 });
      res.status(200).json({ success: true, campaigns });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const { name, contacts, assistantConfig } = req.body;

      // Create assistant in Vapi
      const assistant = await vapiClient.createAssistant(assistantConfig);

      // Create campaign in database
      const campaign = new Campaign({
        name,
        contacts: contacts.map(contact => ({
          ...contact,
          callStatus: 'pending'
        })),
        assistantConfig,
      });

      await campaign.save();

      // Create campaign in Vapi
      const vapiCampaign = await vapiClient.createCampaign(
        assistant.id,
        contacts,
        name
      );

      // Update campaign with Vapi ID
      campaign.vapiCampaignId = vapiCampaign.id;
      await campaign.save();

      res.status(201).json({ success: true, campaign });
    } catch (error) {
      console.error('Campaign creation error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}