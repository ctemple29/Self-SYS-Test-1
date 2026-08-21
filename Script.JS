const canvas = document.querySelector('#canvas');
const context = canvas.getContext('2d');
const cathedral = new Image();
const landscapeImages = [
	{ image: new Image(), source: 'Camelback.jpg' },
	{ image: new Image(), source: 'Notre-Dame_west-facade.avif' },
	{ image: new Image(), source: 'Rocky Mountains.webp' }
];
const palette = {
	background: '#f4f0e8',
	panel: '#fbfaf6',
	line: '#d6d0c4',
	ink: '#24313a'
};

let pixelRatio = 1;
let hoveredSegment = null;
let hoveredLandscapeSegment = null;
let selectedLandscape = Math.floor(Math.random() * landscapeImages.length);
let availableLandscapes = landscapeImages
	.map((_, index) => index)
	.filter((index) => index !== selectedLandscape);

cathedral.src = 'Notre-Dame_west-facade.avif';
cathedral.addEventListener('load', draw);
landscapeImages.forEach(({ image, source }) => {
	image.src = source;
	image.addEventListener('load', draw);
});

function resizeCanvas() {
	pixelRatio = window.devicePixelRatio || 1;
	canvas.width = Math.floor(window.innerWidth * pixelRatio);
	canvas.height = Math.floor(window.innerHeight * pixelRatio);
	canvas.style.width = `${window.innerWidth}px`;
	canvas.style.height = `${window.innerHeight}px`;
	context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
	draw();
}

function drawFigure(x, y, scale = 1, color = palette.ink) {
	const headRadius = 5 * scale;
	const bodyLength = 16 * scale;
	const limbLength = 10 * scale;

	context.save();
	context.strokeStyle = color;
	context.fillStyle = color;
	context.lineWidth = Math.max(1.5, 1.8 * scale);
	context.lineCap = 'round';
	context.beginPath();
	context.arc(x, y - bodyLength - headRadius, headRadius, 0, Math.PI * 2);
	context.moveTo(x, y - bodyLength);
	context.lineTo(x, y);
	context.moveTo(x, y - bodyLength + 5 * scale);
	context.lineTo(x - limbLength, y - bodyLength + 1 * scale);
	context.moveTo(x, y - bodyLength + 5 * scale);
	context.lineTo(x + limbLength, y - bodyLength + 1 * scale);
	context.moveTo(x, y);
	context.lineTo(x - limbLength, y + limbLength);
	context.moveTo(x, y);
	context.lineTo(x + limbLength, y + limbLength);
	context.stroke();
	context.restore();
}

function drawSegmentedImage(image, x, y, width, height, hoveredImageSegment) {
	const panelThird = width / 3;

	context.fillStyle = '#000';
	context.fillRect(x, y, panelThird, height);
	context.fillRect(x + panelThird * 2, y, panelThird, height);

	if (!image.complete || image.naturalWidth === 0) {
		return;
	}

	const sourceThird = image.naturalWidth / 3;
	context.drawImage(
		image,
		sourceThird,
		0,
		sourceThird,
		image.naturalHeight,
		x + panelThird,
		y,
		panelThird,
		height
	);

	if (hoveredImageSegment === 0 || hoveredImageSegment === 2) {
		context.drawImage(
			image,
			sourceThird * hoveredImageSegment,
			0,
			sourceThird,
			image.naturalHeight,
			x + panelThird * hoveredImageSegment,
			y,
			panelThird,
			height
		);
	}
}

function draw() {
	const width = window.innerWidth;
	const height = window.innerHeight;
	const halfWidth = width / 2;
	const halfHeight = height / 2;

	context.clearRect(0, 0, width, height);
	context.fillStyle = palette.background;
	context.fillRect(0, 0, width, height);

	context.fillStyle = palette.panel;
	context.fillRect(0, 0, halfWidth, halfHeight);
	context.fillRect(halfWidth, halfHeight, halfWidth, halfHeight);

	drawSegmentedImage(
		cathedral,
		halfWidth,
		0,
		halfWidth,
		halfHeight,
		hoveredSegment
	);
	drawSegmentedImage(
		landscapeImages[selectedLandscape].image,
		0,
		halfHeight,
		halfWidth,
		halfHeight,
		hoveredLandscapeSegment
	);

	context.strokeStyle = palette.line;
	context.lineWidth = 2;
	context.beginPath();
	context.moveTo(halfWidth, 0);
	context.lineTo(halfWidth, height);
	context.moveTo(0, halfHeight);
	context.lineTo(width, halfHeight);
	context.stroke();

	drawFigure(halfWidth / 2, halfHeight / 2 + 10);
}

canvas.addEventListener('pointermove', (event) => {
	const halfWidth = window.innerWidth / 2;
	const halfHeight = window.innerHeight / 2;

	if (event.clientX >= halfWidth && event.clientY < halfHeight) {
		const topRightThird = halfWidth / 3;
		const segment = Math.floor((event.clientX - halfWidth) / topRightThird);
		hoveredSegment = segment === 0 || segment === 2 ? segment : null;
	} else {
		hoveredSegment = null;
	}

	if (event.clientX < halfWidth && event.clientY >= halfHeight) {
		const bottomLeftThird = halfWidth / 3;
		const segment = Math.floor(event.clientX / bottomLeftThird);
		hoveredLandscapeSegment = segment === 0 || segment === 2 ? segment : null;
	} else {
		hoveredLandscapeSegment = null;
	}

	draw();
});

canvas.addEventListener('pointerleave', () => {
	hoveredSegment = null;
	hoveredLandscapeSegment = null;
	draw();
});

canvas.addEventListener('pointerdown', (event) => {
	const halfWidth = window.innerWidth / 2;
	const halfHeight = window.innerHeight / 2;

	if (event.clientX < halfWidth && event.clientY >= halfHeight) {
		if (availableLandscapes.length === 0) {
			availableLandscapes = landscapeImages.map((_, index) => index);
		}

		const randomPosition = Math.floor(Math.random() * availableLandscapes.length);
		selectedLandscape = availableLandscapes.splice(randomPosition, 1)[0];
		draw();
	}
});

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
