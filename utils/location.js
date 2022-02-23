const axios = require('axios').default;
const AppError = require('./appError');

const API_KEY = 'AIzaSyB1g5KDjBmWSIgw3ze-K97GeFtzG04_PAI';

const getCoordsForAddress = async address => {
  const res = await axios({
    method: 'GET',
    url: `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${API_KEY}`
  });
  const data = await res.data;

  if (!data || data.status === 'ZERO_RESULTS') {
    throw new AppError('Could not find a location for the given address', 404);
  }
  const coordinates = data.results[0].geometry.location;
  return coordinates;
};

module.exports = getCoordsForAddress;
