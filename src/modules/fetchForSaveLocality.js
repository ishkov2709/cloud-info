import axios from 'axios';

const getForSaveLocality = (lat, lon, lang) => {
  return axios.get(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=${lang}`
  );
};

export default getForSaveLocality;
