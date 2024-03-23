let ball;

const socket = io.connect("ws://localhost:8001");

function setup() {
	new Canvas(500, 500);

	ball = new Sprite();
	ball.diameter = 50;
}

function draw() {
	background('grey');
}