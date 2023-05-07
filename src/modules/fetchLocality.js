import axios from 'axios';

const getLocality = city => {
  return axios.get(
    `https://nominatim.openstreetmap.org/search?format=json&q=${city}&accept-language=ua&limit=3`
  );
};

export default getLocality;
