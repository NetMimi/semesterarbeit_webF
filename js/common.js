export const Authorization =
  'Bearer 26|KOcZo3VAEKGhebZZcm8XIoCdUNCVhgyCaFxNBfyZ';

export function showErrorMessage(message) {
  localStorage.setItem('error', message);
  location.href = `./error.html`;
}

export function setLikeCount(likeCount, amount) {
  if (amount === 1) {
    likeCount.innerText = `${amount} Like`;
  } else {
    likeCount.innerText = `${amount} Likes`;
  }
}
