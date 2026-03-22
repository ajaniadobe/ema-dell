import observe from '../../scripts/utils/observer.js';

function decorate(el) {
  el.innerHTML = `<iframe src="${el.dataset.src}" class="youtube"
  webkitallowfullscreen mozallowfullscreen allowfullscreen
  allow="encrypted-media; accelerometer; gyroscope; picture-in-picture"
  scrolling="no"
  title="Youtube Video">`;
}

export default function init(a) {
  const params = new URLSearchParams(a.search);
  const id = params.get('v');
  const isEmbed = a.pathname.startsWith('/embed/');
  // Only convert actual video URLs (?v= or /embed/), not channel/user/playlist links
  if (!id && !isEmbed) return;
  const videoId = id || a.pathname.split('/').pop();
  const div = document.createElement('div');
  div.className = 'video';
  params.append('rel', '0');
  params.delete('v');
  div.dataset.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?${params.toString()}`;
  a.parentElement.replaceChild(div, a);
  observe(div, decorate);
}
