import axios from 'axios';

const getLocality = (city, lang, limit) => {
  return axios.get(
    `https://nominatim.openstreetmap.org/search?format=json&q=${city}&accept-language=${lang}&limit=${limit}`
  );
};

export default getLocality;
