const switchColor = time => {
  if (document.querySelector('.animated')) return;
  document.querySelector('.current-btn').classList.add('animated');
  setTimeout(() => {
    document.querySelector('.animated').classList.remove('animated');
  }, time);
};

export default switchColor;
