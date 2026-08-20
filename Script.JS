const canvas = document.querySelector('#canvas');
const context = canvas.getContext('2d');
const palette = {
	background: '#f4f0e8',
	panel: '#fbfaf6',
	line: '#d6d0c4',
	ink: '#24313a'
};

let pixelRatio = 1;

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

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
