const switchColor = time => {
  if (document.querySelector('.animated')) return;
  document.querySelector('.current-btn').classList.add('animated');
  setTimeout(() => {
    console.log('hihihi');
    document.querySelector('.animated').classList.remove('animated');
  }, time);
};

export default switchColor;
