import Papa from 'papaparse';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { csvData, jsonData } = req.body;
    let contacts = [];

    if (csvData) {
      const parsed = Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
      });

      contacts = parsed.data.map(row => ({
        name: row.name || row.Name,
        phoneNumber: row.phoneNumber || row.phone || row.Phone,
        amount: parseFloat(row.amount || row.Amount) || 0,
      }));
    } else if (jsonData) {
      contacts = Array.isArray(jsonData) ? jsonData : [jsonData];
    }

    // Validate contacts
    const validatedContacts = contacts.filter(contact => 
      contact.name && contact.phoneNumber && contact.amount > 0
    );

    if (validatedContacts.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'No valid contacts found. Please ensure CSV/JSON has name, phoneNumber, and amount fields.' 
      });
    }

    res.status(200).json({ 
      success: true, 
      contacts: validatedContacts,
      total: validatedContacts.length 
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
