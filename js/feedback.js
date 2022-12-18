import { showErrorMessage, Authorization } from './common.js';

//---------- NAME VALIDATION ----------//

const nameInput = document.getElementById('name');
const nameError = document.getElementById('name-error');
const checkName = document.getElementById('check-name');

const validateName = () => {
  const name = nameInput.value.trim();
  const length = name.length;
  let errorMessages = [];

  if (length === 0) {
    errorMessages.push('Bitte geben Sie einen Namen ein.');
  }

  if (length < 3) {
    errorMessages.push('Der Name muss mindestens 3 Zeichen lang sein.');
  }

  if (length > 100) {
    errorMessages.push('Der Name darf maximal 100 Zeichen lang sein.');
  }

  return showErrorOrSuccess(errorMessages, checkName, nameError);
};

nameInput.addEventListener('blur', () => {
  validateName();

  nameInput.addEventListener('input', validateName);
});

//---------- EMAIL VALIDATION----------//

const emailInput = document.getElementById('email');
const emailError = document.getElementById('email-error');
const checkMail = document.getElementById('check-mail');

const validateEmail = () => {
  const email = emailInput.value.trim();
  const length = email.length;
  let errorMessages = [];

  if (length === 0) {
    errorMessages.push('Bitte geben Sie eine E-Mail Adresse ein.');
  }

  if (emailInput.validity.typeMismatch) {
    errorMessages.push('Bitte gebe Sie eine gültige E-Mail Adresse ein.');
  }

  if (length > 200) {
    errorMessages.push(
      'Die E-Mail Adresse darf maximal 200 Zeichen lang sein.'
    );
  }

  return showErrorOrSuccess(errorMessages, checkMail, emailError);
};

emailInput.addEventListener('blur', () => {
  validateEmail();

  emailInput.addEventListener('input', validateEmail);
});

//---------- DESIGN RATING ----------//

const designRange = document.getElementById('design');
const designRating = document.getElementById('design-rating');
const designError = document.getElementById('design-error');
const checkDesign = document.getElementById('check-design');

designRange.addEventListener('input', () => {
  designRating.innerText = designRange.value;
});

const validateDesign = () => {
  const design = Number(designRange.value);
  let errorMessages = [];

  if (design === 0) {
    errorMessages.push('Bitte geben Sie eine Bewertung zwischen 1 und 10 ab.');
  }

  return showErrorOrSuccess(errorMessages, checkDesign, designError);
};

designRange.addEventListener('blur', () => {
  validateDesign();

  designRange.addEventListener('input', validateDesign);
});

//---------- COMPONENTS RATING----------//

const componentRange = document.getElementById('components');
const componentRating = document.getElementById('component-rating');
const componentError = document.getElementById('component-error');
const checkComponent = document.getElementById('check-component');

componentRange.addEventListener('input', () => {
  componentRating.innerText = componentRange.value;
});

const validateComponent = () => {
  const components = Number(componentRange.value);
  let errorMessages = [];

  if (components === 0) {
    errorMessages.push('Bitte geben Sie eine Bewertung zwischen 1 und 10 ab.');
  }

  return showErrorOrSuccess(errorMessages, checkComponent, componentError);
};

componentRange.addEventListener('blur', () => {
  validateComponent();

  componentRange.addEventListener('input', validateComponent);
});

// ---------- ERROR OR SUCCESS ---------- //

function showErrorOrSuccess(errorMessages, checkImg, errorElement) {
  if (errorMessages.length === 0) {
    errorElement.innerText = '';
    checkImg.src = './img/uberpruft.png';
    checkImg.alt = 'check';
    checkImg.style.opacity = '1';
    return true;
  } else {
    errorElement.innerText = errorMessages.join('\r\n');
    checkImg.src = './img/warnung.png';
    checkImg.alt = 'warning';
    checkImg.style.opacity = '1';
    return false;
  }
}

//---------- COMMENT INPUT ----------//

const commentInput = document.getElementById('comment');

//---------- SUBMITBUTTON ----------//

const submitButton = document.getElementById('submit');

submitButton.addEventListener('click', async (e) => {
  e.preventDefault();

  if (
    validateName() &
    validateEmail() &
    validateDesign() &
    validateComponent()
  ) {
    let feedback = {
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      rating_design: Number(designRange.value),
      rating_components: Number(componentRange.value),
    };
    if (commentInput.value.trim() !== '') {
      feedback.comment = commentInput.value.trim();
    }
    await postFeedback(feedback);
  } else {
    nameInput.addEventListener('input', validateName);
    emailInput.addEventListener('input', validateEmail);
    designRange.addEventListener('input', validateDesign);
    componentRange.addEventListener('input', validateComponent);
  }
});

//---------- SEND FORMS ----------//

async function postFeedback(feedback) {
  try {
    let response = await fetch('https://web-modules.dev/api/v1/feedback', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        Authorization,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedback),
    });

    let data = await response.json();

    if (response.status === 200) {
      await getFeedback(feedback.rating_design, feedback.rating_components);
    } else {
      showErrorMessage(data.message);
    }
  } catch (err) {
    showErrorMessage(data.message);
  }
}

//---------- GET INFORMATION FOR STATISTICS ----------//

async function getFeedback(designRatingUser, componentRatingUser) {
  try {
    let response = await fetch('https://web-modules.dev/api/v1/feedback', {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization,
      },
    });

    let data = await response.json();

    if (response.status === 200) {
      calculateStatistics(designRatingUser, componentRatingUser, data);
    } else {
      showErrorMessage(data.message);
    }
  } catch (err) {
    showErrorMessage(data.message);
  }
}

//---------- CALCULATE STATISTICS ----------//

function calculateStatistics(designRatingUser, componentRatingUser, data) {
  let designRatings = [];
  let componentRatings = [];

  for (const feedback of data.feedbacks) {
    designRatings.push(feedback.rating_design);
    componentRatings.push(feedback.rating_components);
  }
  let designRatingAverage = calculateAverage(designRatings);
  let componentRatingAverage = calculateAverage(componentRatings);

  showStatistics(
    designRatingUser,
    designRatingAverage,
    componentRatingUser,
    componentRatingAverage,
    data.amount
  );
}

function calculateSum(numbers) {
  let sum = 0;

  for (const number of numbers) {
    sum += number;
  }
  return sum;
}

function calculateAverage(numbers) {
  const sum = calculateSum(numbers);
  const arrayLength = numbers.length;
  const average = sum / arrayLength;
  return average.toFixed(2);
}

//---------- SHOW STATISTIC IN DOM ----------//
function showStatistics(
  designRatingUser,
  designRatingAverage,
  componentRatingUser,
  componentRatingAverage,
  total
) {
  let feedbackContainer = document.getElementById('feedback');
  feedbackContainer.innerHTML = '';

  let feedbackresultTitle = document.createElement('h2');
  feedbackresultTitle.classList.add('feedbackresult-title');
  feedbackresultTitle.innerText = 'Feedback Auswertung';
  feedbackContainer.appendChild(feedbackresultTitle);

  let feedbackresultText = document.createElement('p');
  feedbackresultText.innerText =
    'Besten Dank für Ihr Feedback. Untenstehend sehen Sie den Durchschnitt der bisher abgegebenen Bewertungen.';
  feedbackContainer.appendChild(feedbackresultText);

  let feedbackTotalResultText = document.createElement('p');
  feedbackTotalResultText.innerHTML = `Es wurden bereits <strong>${total}</strong> Bewertungen abgegeben.`;
  feedbackContainer.appendChild(feedbackTotalResultText);

  let feedbackresultContainer = document.createElement('div');
  feedbackresultContainer.classList.add('feedbackresult-container');
  feedbackContainer.appendChild(feedbackresultContainer);

  let feedbackresultDesign = document.createElement('div');
  feedbackresultDesign.classList.add('feedbackresult-design');
  feedbackresultDesign.innerText = 'Design';
  feedbackresultContainer.appendChild(feedbackresultDesign);

  let feedbackresultComponent = document.createElement('div');
  feedbackresultComponent.classList.add('feedbackresult-component');
  feedbackresultComponent.innerText = 'Komponenten';
  feedbackresultContainer.appendChild(feedbackresultComponent);

  let feedbackresultUser = document.createElement('img');
  feedbackresultUser.classList.add('feedbackresult-user');
  feedbackresultUser.src = './img/person.png';
  feedbackresultContainer.appendChild(feedbackresultUser);

  let feedbackresultAverage = document.createElement('div');
  feedbackresultAverage.classList.add('feedbackresult-average');
  feedbackresultAverage.innerText = 'Ø';
  feedbackresultContainer.appendChild(feedbackresultAverage);

  let feedbackresultDesignUser = document.createElement('div');
  feedbackresultDesignUser.classList.add('feedbackresult-design-user');
  feedbackresultDesignUser.innerText = designRatingUser;
  feedbackresultContainer.appendChild(feedbackresultDesignUser);

  let feedbackresultDesignAverage = document.createElement('div');
  feedbackresultDesignAverage.classList.add('feedbackresult-design-average');
  feedbackresultDesignAverage.innerText = designRatingAverage;
  feedbackresultContainer.appendChild(feedbackresultDesignAverage);

  let feedbackresultComponentUser = document.createElement('div');
  feedbackresultComponentUser.classList.add('feedbackresult-component-user');
  feedbackresultComponentUser.innerText = componentRatingUser;
  feedbackresultContainer.appendChild(feedbackresultComponentUser);

  let feedbackresultComponentAverage = document.createElement('div');
  feedbackresultComponentAverage.classList.add(
    'feedbackresult-component-average'
  );
  feedbackresultComponentAverage.innerText = componentRatingAverage;
  feedbackresultContainer.appendChild(feedbackresultComponentAverage);
}
