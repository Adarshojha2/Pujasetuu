import axios from 'axios';

/**
 * Normalizes state names to handle common abbreviations (e.g. UP, MP, AP)
 * @param {string} state 
 * @returns {string}
 */
const normalizeState = (state) => {
  const s = state.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  if (s === 'up' || s === 'uttarpradesh') return 'uttar pradesh';
  if (s === 'mp' || s === 'madhyapradesh') return 'madhya pradesh';
  if (s === 'ap' || s === 'andhrapradesh') return 'andhra pradesh';
  if (s === 'hp' || s === 'himachalpradesh') return 'himachal pradesh';
  if (s === 'jk' || s === 'jammuandkashmir' || s === 'jammukashmir') return 'jammu & kashmir';
  if (s === 'wb' || s === 'westbengal') return 'west bengal';
  return s;
};

/**
 * Validates if an address actually exists and matches the correct state/city.
 * Uses the Indian Postal Pin Code API for PIN code consistency checks,
 * and OpenStreetMap Nominatim API for general geocoding verification.
 * 
 * @param {Object} address - { street, city, state, zipCode }
 * @returns {Promise<{ valid: boolean, message: string }>}
 */
export const validateAddressOnline = async ({ street, city, state, zipCode }) => {
  // 1. Basic Format Checks
  if (!street || street.trim().length < 5) {
    return { valid: false, message: 'Street address must be at least 5 characters long.' };
  }
  if (!city || city.trim().length < 2) {
    return { valid: false, message: 'City name is invalid.' };
  }
  if (!state || state.trim().length < 2) {
    return { valid: false, message: 'State name is invalid.' };
  }
  if (!zipCode || !/^[0-9]{6}$/.test(zipCode.trim())) {
    return { valid: false, message: 'Postal/PIN Code must be a valid 6-digit number.' };
  }

  const cleanStreet = street.trim();
  const cleanCity = city.trim();
  const cleanState = state.trim();
  const cleanZip = zipCode.trim();

  // 2. Indian Pin Code Consistency Check
  try {
    const pinRes = await axios.get(`https://api.postalpincode.in/pincode/${cleanZip}`);
    
    if (pinRes.data && pinRes.data[0] && pinRes.data[0].Status === 'Success') {
      const postOffices = pinRes.data[0].PostOffice;
      if (postOffices && postOffices.length > 0) {
        const officialState = postOffices[0].State;
        const officialDistrict = postOffices[0].District;
        const officialBlock = postOffices[0].Block;
        const officialTaluk = postOffices[0].Taluk;

        // Verify State
        const normInputState = normalizeState(cleanState);
        const normOfficialState = normalizeState(officialState);
        
        if (normInputState !== normOfficialState && !normOfficialState.includes(normInputState) && !normInputState.includes(normOfficialState)) {
          return {
            valid: false,
            message: `Invalid Address: PIN code ${cleanZip} belongs to the state of ${officialState}, but you entered the state as "${cleanState}".`
          };
        }

        // Verify City/District
        const inputCityLower = cleanCity.toLowerCase();
        const districtLower = officialDistrict.toLowerCase();
        const blockLower = officialBlock.toLowerCase();
        const talukLower = officialTaluk.toLowerCase();

        const cityMatches = 
          inputCityLower.includes(districtLower) || 
          districtLower.includes(inputCityLower) ||
          inputCityLower.includes(blockLower) ||
          blockLower.includes(inputCityLower) ||
          inputCityLower.includes(talukLower) ||
          talukLower.includes(inputCityLower);

        // Allow some flexibility for city names, but reject if completely different
        if (!cityMatches) {
          // Double check with Nominatim just to make sure there isn't a sub-district match
          const geoRes = await axios.get('https://nominatim.openstreetmap.org/search', {
            headers: { 'User-Agent': 'PujaSetu-SpiritualPlatform-Validator' },
            params: { q: `${cleanCity}, ${officialState}`, format: 'json', limit: 1 }
          });
          if (!geoRes.data || geoRes.data.length === 0) {
            return {
              valid: false,
              message: `Invalid Address: PIN code ${cleanZip} is in the district/area of "${officialDistrict}" (${officialState}), which does not match your entered city "${cleanCity}".`
            };
          }
        }
      }
    } else if (pinRes.data && pinRes.data[0] && pinRes.data[0].Status === 'Error') {
      return {
        valid: false,
        message: `Invalid PIN Code: PIN code "${cleanZip}" does not exist in India.`
      };
    }
  } catch (err) {
    console.warn('PIN Code validation API failed or timed out:', err.message);
  }

  // 3. OpenStreetMap Nominatim Geocoding Lookup for Street Address existence
  try {
    const query = `${cleanStreet}, ${cleanCity}, ${cleanState} ${cleanZip}`;
    const headers = { 'User-Agent': 'PujaSetu-SpiritualPlatform-Validator' };

    const res = await axios.get('https://nominatim.openstreetmap.org/search', {
      headers,
      params: { q: query, format: 'json', limit: 1 }
    });

    if (res.data && res.data.length > 0) {
      return { valid: true, message: 'Address verified successfully.' };
    }

    // Check if street name is gibberish
    const cleanStreetNoSpaces = cleanStreet.replace(/\s+/g, '');
    const gibberishRegex = /^(.)\1+$|^[bcdfghjklmnpqrstvwxyz]{6,}$/i;
    if (gibberishRegex.test(cleanStreetNoSpaces)) {
      return { valid: false, message: 'Street address contains invalid or gibberish text.' };
    }

    // If it's a real PIN and City/State match (which we verified above), 
    // we allow the order to proceed even if OSM doesn't have the specific street number (common in Indian towns).
    return { valid: true, message: 'PIN and City match, proceeding.' };
  } catch (err) {
    console.warn('Nominatim Geocoding lookup failed, bypassing geocoding check:', err.message);
    return { valid: true, message: 'Bypassed geocoding check due to connection limitations.' };
  }
};
