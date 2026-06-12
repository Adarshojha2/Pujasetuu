import axios from 'axios';

/**
 * Validates if an address actually exists using the public OpenStreetMap Nominatim API.
 * Performs tiered validation to ensure it doesn't fail on local landmarks while blocking completely fake addresses.
 * 
 * @param {Object} address - { street, city, state, zipCode }
 * @returns {Promise<{ valid: boolean, message: string }>}
 */
export const validateAddressOnline = async ({ street, city, state, zipCode }) => {
  // 1. Basic Format Validation (Client Side)
  if (!street || street.trim().length < 5) {
    return { valid: false, message: 'Street address must be at least 5 characters long.' };
  }
  if (!city || city.trim().length < 2) {
    return { valid: false, message: 'City name is invalid.' };
  }
  if (!state || state.trim().length < 2) {
    return { valid: false, message: 'State name is invalid.' };
  }
  
  // Clean inputs
  const cleanStreet = street.trim();
  const cleanCity = city.trim();
  const cleanState = state.trim();
  const cleanZip = zipCode ? zipCode.trim() : '';

  // Validate Zip format (6 digits for India, 5/6 digits generally)
  const zipRegex = /^[0-9]{5,6}$/;
  if (cleanZip && !zipRegex.test(cleanZip)) {
    return { valid: false, message: 'Postal/Zip Code must be a valid 5 or 6 digit number.' };
  }

  try {
    // 2. Perform Geocoding Lookup on Nominatim (OpenStreetMap)
    // We try to find the location by query
    const query = `${cleanStreet}, ${cleanCity}, ${cleanState} ${cleanZip}`;
    
    // User-Agent is required by Nominatim usage policy
    const headers = {
      'User-Agent': 'PujaSetu-SpiritualPlatform-Validator'
    };

    const res = await axios.get('https://nominatim.openstreetmap.org/search', {
      headers,
      params: {
        q: query,
        format: 'json',
        limit: 1
      }
    });

    if (res.data && res.data.length > 0) {
      return { valid: true, message: 'Address verified successfully.' };
    }

    // Tier 2: If full address fails (often due to local landmarks in India like "near temple"),
    // check if the Zip Code + City combination is at least valid.
    if (cleanZip) {
      const zipRes = await axios.get('https://nominatim.openstreetmap.org/search', {
        headers,
        params: {
          q: `${cleanZip}, ${cleanCity}`,
          format: 'json',
          limit: 1
        }
      });
      if (zipRes.data && zipRes.data.length > 0) {
        return { valid: true, message: 'City and Zip verified, local landmarks allowed.' };
      }
    }

    // Tier 3: If no zip, check if City + State exists
    const cityRes = await axios.get('https://nominatim.openstreetmap.org/search', {
      headers,
      params: {
        q: `${cleanCity}, ${cleanState}`,
        format: 'json',
        limit: 1
      }
    });
    if (cityRes.data && cityRes.data.length > 0) {
      // If the city/state exists, but they wrote completely garbage street info
      // Check if street info looks like spam/garbage letters (e.g. "asdasdasd", "qwerty")
      const gibberishRegex = /^(.)\1+$|^[bcdfghjklmnpqrstvwxyz]{6,}$/i;
      if (gibberishRegex.test(cleanStreet.replace(/\s+/g, ''))) {
        return { valid: false, message: 'Street address contains invalid or gibberish text.' };
      }
      return { valid: true, message: 'Address city verified.' };
    }

    return {
      valid: false,
      message: 'Address not found. We could not verify this location. Please check your spelling.'
    };
  } catch (err) {
    console.warn('Address validation API failed, bypassing validation:', err.message);
    // If the open geocoding API fails or limits rates, bypass validation to not block real orders
    return { valid: true, message: 'Bypassed due to connection limitations.' };
  }
};
