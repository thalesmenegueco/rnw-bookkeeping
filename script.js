const wrapper = document.querySelector('.testimonials-wrapper');
const cards = document.querySelectorAll('.testimonial-card');
const dotsContainer = document.getElementById('dots-container');

// 1. Cria as bolinhas dinamicamente baseada no número de cards
cards.forEach((_, i) => {
  const dot = document.createElement('div');
  dot.classList.add('dot');
  if (i === 0) dot.classList.add('active'); // Primeira bolinha começa ativa
  dotsContainer.appendChild(dot);
});

const dots = document.querySelectorAll('.dot');

// 2. Configura o "Observador" para detectar qual card está visível
const observerOptions = {
  root: wrapper,
  threshold: 0.6 // Ativa quando 60% do card estiver visível
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Descobre o índice do card que entrou na tela
      const index = Array.from(cards).indexOf(entry.target);
      
      // Remove 'active' de todas e adiciona na correta
      dots.forEach(d => d.classList.remove('active'));
      dots[index].classList.add('active');
    }
  });
}, observerOptions);

// 3. Começa a observar cada card
cards.forEach(card => observer.observe(card));