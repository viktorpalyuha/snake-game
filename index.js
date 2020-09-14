let canvas = document.querySelector("#canvas");
let ctx = canvas.getContext("2d");
let width = canvas.width;
let height = canvas.height;
let blockSize = 10;
let widthInBlocks = width / blockSize;
let heightInBlocks = height / blockSize;
let score = 0;
let animationTime = 100;
let stopGame = false;

function drawBorder() {
  ctx.fillStyle = "Gray";
  ctx.fillRect(0, 0, width, blockSize);
  ctx.fillRect(0, height - blockSize, width, blockSize);
  ctx.fillRect(0, 0, blockSize, height);
  ctx.fillRect(width - blockSize, 0, blockSize, height);
}

function drawScore() {
  ctx.font = "15px Courier";
  ctx.fillStyle = "Black";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(`Score: ${score}`, blockSize, blockSize);
}

function circle(x, y, radius, fillCircle) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2, false);
  if (fillCircle) {
    ctx.fill();
  }
  ctx.stroke();
}

function gameOver() {
  stopGame = true;
  ctx.font = "60px Courier";
  ctx.fillStyle = "Black";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Game over", width / 2, height / 2);
}

class Block {
  constructor(col, row) {
    this.col = col;
    this.row = row;
  }

  drawSquare(color) {
    let x = this.col * blockSize;
    let y = this.row * blockSize;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, blockSize, blockSize);
  }

  drawCircle(color) {
    let centerX = this.col * blockSize + blockSize / 2;
    let centerY = this.row * blockSize + blockSize / 2;
    ctx.fillStyle = color;
    circle(centerX, centerY, blockSize / 2, true);
  }

  equal(otherBlock) {
    return this.col === otherBlock.col && this.row === otherBlock.row;
  }
}

class Snake {
  constructor() {
    this.segments = [new Block(7, 5), new Block(6, 5), new Block(5, 5)];
    this.direction = "right";
    this.nextDirection = "right";
  }

  draw() {
    this.segments.map((segment, i) =>
      i === 0
        ? segment.drawSquare("Green")
        : i % 2 !== 0
        ? segment.drawSquare("Blue")
        : segment.drawSquare("Yellow")
    );
  }

  move() {
    let head = this.segments[0];
    let newHead;

    this.direction = this.nextDirection;

    if (this.direction === "right") {
      newHead = new Block(head.col + 1, head.row);
    } else if (this.direction === "down") {
      newHead = new Block(head.col, head.row + 1);
    } else if (this.direction === "left") {
      newHead = new Block(head.col - 1, head.row);
    } else if (this.direction === "up") {
      newHead = new Block(head.col, head.row - 1);
    }

    if (this.checkColission(newHead)) {
      gameOver();
      return;
    }

    this.segments.unshift(newHead);

    if (newHead.equal(apple.position)) {
      score++;
      if(animationTime !== 1) {
        animationTime--;
      }
      apple.move();
    } else {
      this.segments.pop();
    }
  }

  checkColission(head) {
    let leftColission = head.col === 0;
    let topColission = head.row === 0;
    let rightColission = head.col === widthInBlocks - 1;
    let bottomColission = head.row === heightInBlocks - 1;

    let wallColission =
      leftColission || topColission || rightColission || bottomColission;

    let selfColission = false;

    for (let i = 0; i < this.segments.length; i++) {
      if (head.equal(this.segments[i])) {
        selfColission = true;
      }
    }

    return wallColission || selfColission;
  }

  setDirection(newDirection) {
    if (this.direction === "up" && newDirection === "down") {
      return;
    } else if (this.direction === "right" && newDirection === "left") {
      return;
    } else if (this.direction === "down" && newDirection === "up") {
      return;
    } else if (this.direction === "left" && newDirection === "right") {
      return;
    }

    this.nextDirection = newDirection;
  }
}

class Apple {
  constructor() {
    this.position = new Block(10, 10);
  }

  draw() {
    this.position.drawCircle("LimeGreen");
  }

  move() {
    let randomCol = Math.floor(Math.random() * (widthInBlocks - 2)) + 1;
    let randomRow = Math.floor(Math.random() * (heightInBlocks - 2)) + 1;
    if(snake.segments.filter(segment => segment === this.position).length !== 0) {
      this.move();
      return;
    }

    this.position = new Block(randomCol, randomRow);
  }
}

let snake = new Snake();
let apple = new Apple();

let directions = {
  37: "left",
  38: "up",
  39: "right",
  40: "down",
};

document.querySelector("body").addEventListener("keydown", (event) => {
  let newDirection = directions[event.keyCode];
  if (newDirection !== undefined) {
    snake.setDirection(newDirection);
  }
});

function gameLoop() {
  if(stopGame) return;

  ctx.clearRect(0, 0, height, width);
  drawScore();
  snake.move();
  snake.draw();
  apple.draw();
  drawBorder();

  setTimeout(gameLoop, animationTime);

}

gameLoop();
