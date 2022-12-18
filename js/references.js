import { showErrorMessage, Authorization, setLikeCount } from './common.js';

let cardContainer = document.getElementById('card-container');

//---------- GET TESTIMONIALS FROM API ----------//

async function fetchTestimonials() {
  try {
    let response = await fetch(
      'https://web-modules.dev/api/v1/testimonials/6',
      {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization,
        },
      }
    );

    let data = await response.json();

    if (response.status === 200) {
      data.testimonials.forEach((testimonial) => {
        appendTestimonial(testimonial);
      });
    } else {
      showErrorMessage(data.message);
    }
  } catch (err) {
    showErrorMessage(data.message);
  }
}
//---------- APPEND TESTIMONIALS TO DOM ----------//

function appendTestimonial(testimonial) {
  let article = document.createElement('article');
  article.classList.add('card');

  let avatar = document.createElement('img');
  avatar.src = testimonial.avatar;
  avatar.alt = 'Image';
  article.appendChild(avatar);

  let cardContent = document.createElement('div');
  cardContent.classList.add('card-content');
  article.appendChild(cardContent);

  let cardName = document.createElement('span');
  cardName.classList.add('card-name');
  cardName.innerText = `${testimonial.firstname} ${testimonial.lastname}`;
  cardContent.appendChild(cardName);

  let cardCompany = document.createElement('span');
  cardCompany.classList.add('card-company');
  cardCompany.innerText = testimonial.company;
  cardContent.appendChild(cardCompany);

  let cardText = document.createElement('p');
  cardText.classList.add('card-text');
  if (testimonial.quote !== '') {
    cardText.innerText = `"${testimonial.quote}"`;
  }
  cardContent.appendChild(cardText);

  let likeContainer = document.createElement('div');
  likeContainer.classList.add('likes');
  cardContent.appendChild(likeContainer);

  let likeImg = document.createElement('img');
  likeImg.src = './img/heart.png';
  likeImg.alt = 'Like';
  likeImg.classList.add('likes-img');
  likeContainer.appendChild(likeImg);

  let likeCount = document.createElement('span');
  setLikeCount(likeCount, testimonial.likes_count);
  likeContainer.appendChild(likeCount);

  likeImg.addEventListener('click', async (e) => {
    await sendLike(testimonial, likeCount);
  });

  cardContainer.appendChild(article);
}

//---------- LIKES ----------//

async function sendLike(testimonial, likeCount) {
  try {
    let response = await fetch('https://web-modules.dev/api/v1/like', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        Authorization,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'testimonial',
        id: testimonial.id,
      }),
    });

    let data = await response.json();

    if (response.status === 200) {
      setLikeCount(likeCount, data.amount);
    } else {
      showErrorMessage(data.message);
    }
  } catch (err) {
    showErrorMessage(data.message);
  }
}

fetchTestimonials();
