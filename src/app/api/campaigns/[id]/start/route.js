import dbConnect from '../../../../lib/db';
import Campaign from '../../../../lib/models/Campaign';
import vapiClient from '../../../../lib/vapi';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  await dbConnect();

  try {
    const { id } = req.query;
    const campaign = await Campaign.findById(id);

    if (!campaign) {
      return res.status(404).json({ success: false, error: 'Campaign not found' });
    }

    // Start campaign in Vapi
    await vapiClient.startCampaign(campaign.vapiCampaignId);

    // Update campaign status
    campaign.status = 'active';
    campaign.updatedAt = new Date();
    await campaign.save();

    res.status(200).json({ success: true, campaign });
  } catch (error) {
    console.error('Error starting campaign:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// pages/api/webhooks/vapi.js - Webhook handler
import dbConnect from '../../../lib/db';
import Campaign from '../../../lib/models/Campaign';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  await dbConnect();

  try {
    const { type, data } = req.body;

    switch (type) {
      case 'call.started':
        await handleCallStarted(data);
        break;
      case 'call.ended':
        await handleCallEnded(data);
        break;
      case 'call.failed':
        await handleCallFailed(data);
        break;
      default:
        console.log('Unhandled webhook type:', type);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

async function handleCallStarted(data) {
  const { callId, phoneNumber, campaignId } = data;
  
  const campaign = await Campaign.findOne({ vapiCampaignId: campaignId });
  if (!campaign) return;

  const contact = campaign.contacts.find(c => c.phoneNumber === phoneNumber);
  if (contact) {
    contact.callStatus = 'calling';
    contact.callId = callId;
    contact.lastCalled = new Date();
    await campaign.save();
  }
}

async function handleCallEnded(data) {
  const { callId, phoneNumber, campaignId, duration, transcript, summary } = data;
  
  const campaign = await Campaign.findOne({ vapiCampaignId: campaignId });
  if (!campaign) return;

  const contact = campaign.contacts.find(c => c.phoneNumber === phoneNumber);
  if (contact) {
    contact.callStatus = 'completed';
    contact.callDuration = duration;
    contact.transcript = transcript;
    contact.summary = summary;
    contact.callResult = 'completed';
    await campaign.save();
  }
}

async function handleCallFailed(data) {
  const { callId, phoneNumber, campaignId, reason } = data;
  
  const campaign = await Campaign.findOne({ vapiCampaignId: campaignId });
  if (!campaign) return;

  const contact = campaign.contacts.find(c => c.phoneNumber === phoneNumber);
  if (contact) {
    contact.callStatus = 'failed';
    contact.callResult = reason;
    contact.retryCount += 1;
    await campaign.save();
  }
}