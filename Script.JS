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
const figures = [];
const revealedTopRightSegments = new Set();
const revealedBottomLeftSegments = new Set();
let selectedLandscape = Math.floor(Math.random() * landscapeImages.length);
let availableLandscapes = landscapeImages
	.map((_, index) => index)
	.filter((index) => index !== selectedLandscape);
let selectedBottomRight = Math.floor(Math.random() * landscapeImages.length);
let availableBottomRight = landscapeImages
	.map((_, index) => index)
	.filter((index) => index !== selectedBottomRight);
const revealedBottomRightSegments = new Set();
const panelText = [
	{
		x: 0,
		y: 0,
		title: 'The Mascot',
		body: "Testing the ease of copying the stickfigure. Clicking controls imput which was added once I realised it wasn't exactly testing how easily the sigil could be copied."
	},
	{
		x: 1,
		y: 0,
		title: 'The Foundations',
		body: 'Testing the fundamentals of the hover-to-reveal behavior. Simply hovering over the blacked out segments reveals it. Added the fact it persists after hovering so one could have a proper chance to admire the piece, as intended.'
	},
	{
		x: 0,
		y: 1,
		title: 'The Variety',
		body: 'This is testing the randomisation of the image displayed as tested in test 2. The click of a mouse randomises the image out of a current set of three.'
	},
	{
		x: 1,
		y: 1,
		title: 'The Appeal',
		body: 'This is testing the visual effect of vignette to add some texture and not to have a simple black box. This is not controlled by anything and was changed slightly, less intense of a fade to grey.'
	}
];

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

function drawSegmentedImage(
	image,
	x,
	y,
	width,
	height,
	revealedSegments,
	useVignette = false
) {
	const panelThird = width / 3;

	[0, 2].forEach((segment) => {
		if (useVignette) {
			const gradient = context.createRadialGradient(
				x + panelThird * segment + panelThird / 2,
				y + height / 2,
				0,
				x + panelThird * segment + panelThird / 2,
				y + height / 2,
				Math.max(panelThird, height) / 2
			);
			gradient.addColorStop(0, '#000');
			gradient.addColorStop(1, '#292929');
			context.fillStyle = gradient;
		} else {
			context.fillStyle = '#000';
		}
		context.fillRect(x + panelThird * segment, y, panelThird, height);
	});

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

	const segmentsToReveal = revealedSegments instanceof Set
		? [...revealedSegments]
		: [revealedSegments];
	segmentsToReveal.forEach((segment) => {
		if (segment !== 0 && segment !== 2) {
			return;
		}

		context.drawImage(
			image,
			sourceThird * segment,
			0,
			sourceThird,
			image.naturalHeight,
			x + panelThird * segment,
			y,
			panelThird,
			height
		);
	});
}

function wrapText(text, maxWidth) {
	const words = text.split(' ');
	const lines = [];
	let line = '';

	words.forEach((word) => {
		const candidate = line ? `${line} ${word}` : word;
		if (context.measureText(candidate).width <= maxWidth || !line) {
			line = candidate;
		} else {
			lines.push(line);
			line = word;
		}
	});

	if (line) {
		lines.push(line);
	}

	return lines;
}

function drawPanelText(width, height) {
	const panelWidth = width / 2;
	const panelHeight = height / 2;
	const padding = Math.max(12, Math.min(panelWidth, panelHeight) * 0.035);
	const titleSize = Math.max(16, Math.min(28, panelWidth * 0.045));
	const bodySize = Math.max(9, Math.min(14, panelWidth * 0.021));
	const lineHeight = bodySize * 1.35;

	panelText.forEach(({ x, y, title, body }) => {
		const panelX = x * panelWidth;
		const panelY = y * panelHeight;
		const textWidth = panelWidth - padding * 2;
		const textColor = x === 0 && y === 0 ? palette.ink : '#fff';

		context.save();
		context.fillStyle = textColor;
		context.shadowColor = textColor === '#fff' ? 'rgba(0, 0, 0, 0.65)' : 'rgba(255, 255, 255, 0.7)';
		context.shadowBlur = 3;
		context.textAlign = 'left';
		context.textBaseline = 'top';
		context.font = `700 ${titleSize}px "Nanum Myeongjo", serif`;
		context.fillText(title, panelX + padding, panelY + padding);

		context.font = `400 ${bodySize}px "Nanum Myeongjo", serif`;
		const lines = wrapText(body, textWidth);
		const bodyStart = panelY + panelHeight - padding - lines.length * lineHeight;
		lines.forEach((line, index) => {
			context.fillText(line, panelX + padding, bodyStart + index * lineHeight);
		});
		context.restore();
	});
}

function draw() {
	const width = window.innerWidth;
	const height = window.innerHeight;
	const halfWidth = width / 2;
	const halfHeight = height / 2;
	if (figures.length === 0) {
		figures.push({ x: halfWidth / 2, y: halfHeight / 2 + 10 });
	}

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
		revealedTopRightSegments
	);
	drawSegmentedImage(
		landscapeImages[selectedLandscape].image,
		0,
		halfHeight,
		halfWidth,
		halfHeight,
		revealedBottomLeftSegments
	);
	drawSegmentedImage(
		landscapeImages[selectedBottomRight].image,
		halfWidth,
		halfHeight,
		halfWidth,
		halfHeight,
		revealedBottomRightSegments,
		true
	);

	context.strokeStyle = palette.line;
	context.lineWidth = 2;
	context.beginPath();
	context.moveTo(halfWidth, 0);
	context.lineTo(halfWidth, height);
	context.moveTo(0, halfHeight);
	context.lineTo(width, halfHeight);
	context.stroke();

	figures.forEach(({ x, y }) => drawFigure(x, y));
	drawPanelText(width, height);
}

canvas.addEventListener('pointermove', (event) => {
	const halfWidth = window.innerWidth / 2;
	const halfHeight = window.innerHeight / 2;

	if (event.clientX >= halfWidth && event.clientY < halfHeight) {
		const topRightThird = halfWidth / 3;
		const segment = Math.floor((event.clientX - halfWidth) / topRightThird);
		if (segment === 0 || segment === 2) {
			revealedTopRightSegments.add(segment);
		}
	}

	if (event.clientX < halfWidth && event.clientY >= halfHeight) {
		const bottomLeftThird = halfWidth / 3;
		const segment = Math.floor(event.clientX / bottomLeftThird);
		if (segment === 0 || segment === 2) {
			revealedBottomLeftSegments.add(segment);
		}
	}

	if (event.clientX >= halfWidth && event.clientY >= halfHeight) {
		const bottomRightThird = halfWidth / 3;
		const segment = Math.floor((event.clientX - halfWidth) / bottomRightThird);
		if (segment === 0 || segment === 2) {
			revealedBottomRightSegments.add(segment);
		}
	}

	draw();
});

canvas.addEventListener('pointerleave', () => {
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
		revealedBottomLeftSegments.clear();
		draw();
	}

	if (event.clientX >= halfWidth && event.clientY >= halfHeight) {
		if (availableBottomRight.length === 0) {
			availableBottomRight = landscapeImages.map((_, index) => index);
		}

		const randomPosition = Math.floor(Math.random() * availableBottomRight.length);
		selectedBottomRight = availableBottomRight.splice(randomPosition, 1)[0];
		revealedBottomRightSegments.clear();
		draw();
	}

	if (event.clientX < halfWidth && event.clientY < halfHeight) {
		figures.push({ x: event.clientX, y: event.clientY + 10 });
		draw();
	}
});

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
if (document.fonts) {
	document.fonts.ready.then(draw);
}
