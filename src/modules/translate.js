import axios from 'axios';

const translate = (from, to, txt) => {
  return axios.get(
    `https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&sl=${from}&tl=${to}&q=${txt}`
  );
};

export default translate;
