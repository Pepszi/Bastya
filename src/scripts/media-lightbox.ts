/** Opens the image and YouTube lightboxes used by event galleries. */

export function initMediaLightboxes(root: ParentNode = document) {
	const galleries = root.querySelectorAll<HTMLElement>(
		'[data-media-lightbox]:not([data-lightbox-ready])',
	);

	for (const gallery of galleries) {
		gallery.dataset.lightboxReady = 'true';
		bindLightbox(gallery);
	}
}

function bindLightbox(gallery: HTMLElement) {
	const dialog = gallery.querySelector<HTMLDialogElement>('[data-lightbox-dialog]');
	const triggers = [...gallery.querySelectorAll<HTMLButtonElement>('[data-lightbox-open]')];
	if (!dialog || triggers.length === 0) return;

	const image = dialog.querySelector<HTMLImageElement>('[data-lightbox-image]');
	const frameWrap = dialog.querySelector<HTMLElement>('[data-lightbox-frame-wrap]');
	const frame = dialog.querySelector<HTMLIFrameElement>('[data-lightbox-frame]');
	const caption = dialog.querySelector<HTMLElement>('[data-lightbox-caption]');
	const prev = dialog.querySelector<HTMLButtonElement>('[data-lightbox-prev]');
	const next = dialog.querySelector<HTMLButtonElement>('[data-lightbox-next]');
	let index = 0;

	const show = (nextIndex: number) => {
		index = (nextIndex + triggers.length) % triggers.length;
		const trigger = triggers[index];
		const kind = trigger.dataset.kind;
		const src = trigger.dataset.src ?? '';
		const alt = trigger.dataset.alt ?? '';
		const text = trigger.dataset.caption ?? '';

		if (caption) {
			caption.textContent = text;
			caption.hidden = text.length === 0;
		}

		if (kind === 'video' && frame && frameWrap) {
			if (image) image.hidden = true;
			frameWrap.hidden = false;
			frame.title = alt || 'YouTube videó';
			frame.src = src;
		} else if (image) {
			if (frame) frame.src = '';
			if (frameWrap) frameWrap.hidden = true;
			image.hidden = false;
			image.alt = alt;
			image.src = src;
		}

		const single = triggers.length < 2;
		if (prev) prev.hidden = single;
		if (next) next.hidden = single;
	};

	const close = () => dialog.close();

	triggers.forEach((trigger, triggerIndex) => {
		trigger.addEventListener('click', () => {
			show(triggerIndex);
			dialog.showModal();
		});
	});

	dialog.querySelector('[data-lightbox-close]')?.addEventListener('click', close);
	prev?.addEventListener('click', () => show(index - 1));
	next?.addEventListener('click', () => show(index + 1));

	dialog.addEventListener('click', (event) => {
		if (event.target === dialog) close();
	});

	dialog.addEventListener('close', () => {
		if (frame) frame.src = '';
	});

	dialog.addEventListener('keydown', (event) => {
		if (event.key === 'ArrowLeft') {
			event.preventDefault();
			show(index - 1);
		}
		if (event.key === 'ArrowRight') {
			event.preventDefault();
			show(index + 1);
		}
	});
}
