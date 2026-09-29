/** Opens and closes the home page hero YouTube video modal. */
export function initHeroVideoModal() {
	const openBtn = document.querySelector<HTMLButtonElement>('[data-video-open]');
	const modal = document.querySelector<HTMLDialogElement>('[data-video-modal]');
	const closeBtn = document.querySelector<HTMLButtonElement>('[data-video-close]');
	const frame = document.querySelector<HTMLIFrameElement>('[data-video-frame]');
	if (!openBtn || !modal || !frame) return;

	const videoSrc =
		'https://www.youtube-nocookie.com/embed/xefdg-9LMuo?si=5yVAy6OpvQygYDQu&autoplay=1';

	const open = () => {
		frame.src = videoSrc;
		modal.showModal();
	};

	const close = () => {
		modal.close();
	};

	openBtn.addEventListener('click', open);
	closeBtn?.addEventListener('click', close);

	modal.addEventListener('click', (event) => {
		if (event.target === modal) close();
	});

	modal.addEventListener('close', () => {
		frame.src = '';
	});
}
