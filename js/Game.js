class Game {
  constructor() {
    this.resetTitle = createElement("h2");
    this.resetButton = createButton("");
    
    //PRIMERO CREAR TEXTO PARA PUNTUACIÓN,TEXTO JUGADOR 1Y2, LUEGO MOSTRARLO EN HANDLEELEMENTS
    this.leadeboardTitle = createElement("h2");
    this.leader1 = createElement("h2");
    this.leader2 = createElement("h2");
  }

  getState() {
    var gameStateRef = database.ref("gameState");
    gameStateRef.on("value", function(data) {
      gameState = data.val();
    });
  }
  update(state) {
    database.ref("/").update({
      gameState: state
    });
  }

  start() {
    player = new Player();
    playerCount = player.getCount();
    //AGREGAR CAMBIO
    database.ref("/").update({
      carsAtEnd: 0
    });

    form = new Form();
    form.display();

    car1 = createSprite(width / 2 - 50, height - 100);
    car1.addImage("car1", car1_img);
    car1.scale = 0.07;

    car2 = createSprite(width / 2 + 100, height - 100);
    car2.addImage("car2", car2_img);
    car2.scale = 0.07;

    cars = [car1, car2];

    // C38 TA
    fuels = new Group();
    powerCoins = new Group();

    // Agregando sprite de combustible al juego
    this.addSprites(fuels, 4, fuelImage, 0.02);

    // Agregando sprite de moneda al juego
    this.addSprites(powerCoins, 18, powerCoinImage, 0.09);
  }

  // C38 TA
  addSprites(spriteGroup, numberOfSprites, spriteImage, scale) {
    for (var i = 0; i < numberOfSprites; i++) {
      var x, y;

      x = random(width / 2 + 150, width / 2 - 150);
      y = random(-height * 4.5, height - 400);

      var sprite = createSprite(x, y);
      sprite.addImage("sprite", spriteImage);

      sprite.scale = scale;
      spriteGroup.add(sprite);
    }
  }

  handleElements() {
    form.hide();
    form.titleImg.position(40, 50);
    form.titleImg.class("gameTitleAfterEffect");
    this.resetTitle.html("Reiniciar juego");
    this.resetTitle.class("resetText");
    this.resetTitle.position(width / 2 + 200, 40);

    this.resetButton.class("resetButton");
    this.resetButton.position(width / 2 + 230, 100);
//SEGUNDO MOSTRAR TEXTOS, LUEGO IR AL ARCHIVO STYLE.CSS PARA AGREGAR ESTILOS DE TEXTO
//mostrar texto puntuación 
this.leadeboardTitle.html("Tabla de puntuación");
this.leadeboardTitle.class("resetText");
this.leadeboardTitle.position(width / 3 - 60, 40);
//mostrar texto jugador 1
this.leader1.class("leadersText");
this.leader1.position(width / 3 - 50, 80);
//mostrar texto jugador 2
this.leader2.class("leadersText");
this.leader2.position(width / 3 - 50, 130);
    


  }

  play() {
    this.handleElements();
    this.handleResetButton();
    Player.getPlayersInfo();
    player.getCarsAtEnd();

    if (allPlayers !== undefined) {
      image(track, 0, -height * 5, width, height * 6);
      //SEXTO LLAMAR MÉTODO E IR AL ARCHIVO PLAYER
      //IR A PLAYERS Y AGREGAR CAMPOS FALTANTES
      this.showLeaderboard();
      this.showLife();
      this.showFuelBar();

      //índice de la matriz
      var index = 0;
      for (var plr in allPlayers) {
        //agrega 1 al índice por cada bucle
        index = index + 1;

        //utiliza datos de la base de datos para mostrar los autos en la direccion x e y.
        var x = allPlayers[plr].positionX;
        var y = height - allPlayers[plr].positionY;

        cars[index - 1].position.x = x;
        cars[index - 1].position.y = y;

        // C38  SA
        if (index === player.index) {
          stroke(10);
          fill("red");
          ellipse(x, y, 60, 60);

          this.handleFuel(index);
          this.handlePowerCoins(index);
          
          // Cambiando la posición de la cámara en la dirección y
          camera.position.x = cars[index - 1].position.x;
          camera.position.y = cars[index - 1].position.y;

        }
      }

      // manejando eventos keyboard
      if (keyIsDown(UP_ARROW)) {
        player.positionY += 10;
        player.update();
      }
      this.handlePlayerControls();
      const finishLine=height*6-100;
      if(player.positionY>finishLine){
        gameState=2;
        player.rank += 1;
        Player.updateCarsAtEnd(player.rank)
        player.update();
        this.showRank();

      }

      drawSprites();
    }
  }

  handleFuel(index) {
    // Agergando combustible
    cars[index - 1].overlap(fuels, function(collector, collected) {
      player.fuel = 185;
      //recolectado está el sprite en el grupo de recolectable que activaron
      //el evento
      collected.remove();
    });
  }
//TERCERO EXPLICAR PUNTUACIÓN E INICIA LA ACTIVIDAD DEL ALUMNO 
  handlePowerCoins(index) {
    cars[index - 1].overlap(powerCoins, function(collector, collected) {
      player.score += 21;
      player.update();
      //recolectado está el sprite en el grupo de recolectable que activaron
      //el evento
      collected.remove();
    });
  }

handleResetButton() {
  this.resetButton.mousePressed(() => {
    database.ref("/").set({
      playerCount: 0,
      gameState: 0,
      players: {}
    });
    window.location.reload();
  });
}
showLife() {
  push();
  image(lifeImage, width / 2 - 130, height - player.positionY - 550, 20, 20);
  fill("white");
  rect(width / 2 - 100, height - player.positionY - 550, 185, 20);
  fill("#f50057");
  rect(width / 2 - 100, height - player.positionY - 550, player.life, 20);
  noStroke();
  pop();
}
showFuelBar() {
  push();
  image(fuelImage, width / 2 - 130, height - player.positionY - 100, 20, 20);
  fill("white");
  rect(width / 2 - 100, height - player.positionY - 100, 185, 20);
  fill("#ffc400");
  rect(width / 2 - 100, height - player.positionY - 100, player.fuel, 20);
  noStroke();
  pop();
}

//CUARTO CREAR MÉTODO PARA VERFICAR SI UNO DE LOS DOS JUGADORES ES EL LIDER
showLeaderboard() {
  var leader1, leader2;
  var players = Object.values(allPlayers);
  if (
    (players[0].rank === 0 && players[1].rank === 0) ||
    players[0].rank === 1
  ) {
    // &emsp;    Esta etiqueta se utiliza para mostrar cuatro espacios
    leader1 =
      players[0].rank +
      "&emsp;" +
      players[0].name +
      "&emsp;" +
      players[0].score;

    leader2 =
      players[1].rank +
      "&emsp;" +
      players[1].name +
      "&emsp;" +
      players[1].score;
  }

  if (players[1].rank === 1) {
    leader1 =
      players[1].rank +
      "&emsp;" +
      players[1].name +
      "&emsp;" +
      players[1].score;

    leader2 =
      players[0].rank +
      "&emsp;" +
      players[0].name +
      "&emsp;" +
      players[0].score;
  }
  this.leader1.html(leader1);
  this.leader2.html(leader2);
}

handlePlayerControls() {
  if (keyIsDown(UP_ARROW)) {
    player.positionY += 10;
    player.update();
  }

  if (keyIsDown(LEFT_ARROW) && player.positionX > width / 3 - 50) {
    player.positionX -= 5;
    player.update();
  }

  if (keyIsDown(RIGHT_ARROW) && player.positionX < width / 2 + 300) {
    player.positionX += 5;
    player.update();
  }
}
showRank(){
  swal({
    title: `¡Impresionante!${"\n"}Rank${"\n"}${player.rank}`,
    text:"Cruzaste la linea de meta con éxito",
    imageUrl:
      "https://raw.githubusercontent.com/vishalgaddam873/p5-multiplayer-car-race-game/master/assets/cup.png",
    imageSize:"100x100",
    confirmButtonText:"ok"


  })
}

}
