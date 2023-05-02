import './index.html';
import './index.scss';
import dashedline from './modules/dashedline';

const refs = {
  humidityList: document.querySelector('.js-humidity-list'),
};

[...refs.humidityList.children].forEach(el => el.append(dashedline(18)));
