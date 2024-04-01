class Menu{
    constructor(){
        this.buttons = [];
        let joinoptions = {
            text: "Create Room",
            textSize: 32,
            color: 'black',
            hoverColor: 'white',
            defaultColor: 'grey'
        };
        let createbutton = new Button(width/2, height/2, 200, 50, () => {
            this.createRoom();
        }, joinoptions);
        this.buttons.push(createbutton);
        
        let moreinfooptions = {
            text: "More Info",
            textSize: 32,
            color: 'black',
            hoverColor: 'white',
            defaultColor: 'grey'
        };
        let moreinfobutton = new Button(width/2, height/2 + 100, 200, 50, () => {
            try {
                window.open("https://github.com/Apollo199999999/cep-wa3-unplugged-plugged", "_blank", "toolbar=yes,scrollbars=yes,resizable=yes,width=400");
            } catch (e) {
                console.error(e);
            }
            
        }, moreinfooptions);
        this.buttons.push(moreinfobutton);

        let joinexistingoptions = {
            text: "Join Room",
            textSize: 32,
            color: 'black',
            hoverColor: 'white',
            defaultColor: 'grey'
        };
        this.roominput = createInput();
        styleinput(this.roominput, width/2, height/2 + 200, document.body, "Room Code: ");
        this.roominput.input(() => {
            //this.joinRoom();
            //this.roominput.value(this.roominput.value().toUpperCase());
        });
        this.ignInp = createInput();
        styleinput(this.ignInp, width/2, height/2 + 250, document.body, "In-Game Name: ");
        // this.ignInp.input(() => {
        //     this.joinRoom();
        //     //this.ignInp.value(this.ignInp.value().toUpperCase());
        // });
        let joinbutton = new Button(width/2, height/2 + 200, 200, 50, () => {
            this.joinRoom();
        }, joinexistingoptions);
        this.buttons.push(joinbutton);


        


        
    }
    joinRoom(){
        let room_code_input = this.roominput.value();
        console.log(room_code_input);
        if (room_code_input.length !== 5) {
            this.errorMsg = "Invalid Code (5 Characters)";
            return;
        }
        if (!this.ignInp.value()) {
            this.errorMsg = "Please enter an In-Game Name and Retype Code";
            return;
        }
        socket.emit("requestJoinRoom", room_code_input, this.ignInp.value());
    }
    createRoom(){
        if (!socket.connected) return;
        //console.log(this.ignInp.value());
        if (!this.ignInp.value()) {
      this.errorMsg = "Please enter an In-Game Name";
      console.log("no ign");
      return;
    }
        //console.log(this.ignInp.value());
        socket.emit('requestCreateRoom', this.ignInp.value());

    }
    hide() {
        //this.roomCodeInp.hide();
        //this.ignInp.elt.classList.add("hidden");
        //this.menuMusic.pause();
    }
    show() {
        //this.roomCodeInp.style("display", "block");
        //this.ignInp.style("display", "block");
        //this.menuMusic.play();
    }
    update(){
        for (let button of this.buttons){
            //console.log(button)
            button.update();
            button.display();
        }
    
    }
}

class Button {
    constructor(x,y,w,h, fn, options){
        this.position = createVector(x,y);
        this.size = createVector(w,h);
        this.pressed = false;
        this.hover = false;
        this.fn = fn; //on press, execute function
        this.options = options;
        this.prevPressed = false;

    }
    display(){
        push();
        //console.log(this.position.x, this.position.y, this.size.x, this.size.y);
        rectMode(CENTER);
        fill(255);
        if (this.hover){
            if (this.options.hoverColor != null){
                fill(this.options.hoverColor);
            }
            //fill('blue');//temporary
        } else {
            if (this.options.defaultColor != null){
                fill(this.options.defaultColor);
            }
            //fill('green');
        }
        rect(this.position.x, this.position.y, this.size.x, this.size.y);
        if (this.options.text != undefined && this.options.textSize != null && this.options.color != null){
            fill(this.options.color);
            textSize(this.options.textSize);
            textAlign(CENTER, CENTER);
            text(this.options.text, this.position.x, this.position.y);
        }
        pop();
    }
    update(){
        //console.log(mouseX, mouseY, this.position.x - this.size.x/2, this.position.x + this.size.x/2, this.position.y - this.size.y/2, this.position.y + this.size.y/2)
        if (mouseX > this.position.x - this.size.x/2 && mouseX < this.position.x + this.size.x/2 && mouseY > this.position.y - this.size.y/2 && mouseY < this.position.y + this.size.y/2){
            this.hover = true;
            if (mouseIsPressed && mouseButton == LEFT){
                if (!this.prevPressed){
                    console.log("pressed");
                    this.prevPressed = true;
                    this.fn();
                }
                this.prevPressed = true;
                // this.pressed = true;
                // this.fn();
            } else {
                this.prevPressed = false;
            }
        } else {
            this.pressed = false;
            this.prevPressed = false;
            this.hover = false;
        }
    }
    adjustPosition(x,y){
        this.position = createVector(x,y);
    }
    adjustSize(w,h){
        this.size = createVector(w,h);
    }
}

function styleinput(input, x, y, main, label, w = "70") {
  //tailwind styling for the input tabs
  let maininput = createDiv();
  maininput.class("mb-4 h-10 flex ");
  maininput.parent(main);
  maininput.position(x, y);
  let labelinput = createDiv(label);
  labelinput.parent(maininput);
  labelinput.class(
    " w-" +
      w +
      " h-50 text-gray-500 dark:text-gray-400 inline-flex items-center px-3 text-xl text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md p-2.5 hover:bg-indigo-600 dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600"
  );
  input.style("width", "4em");
  input.parent(maininput);
  input.class(
    "h-50 rounded-none rounded-r-lg bg-gray-50 border text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-xl border-gray-300 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 hover:border-indigo-600 dark:hover:border-indigo-600 animate-[wiggle_1s_ease-in-out_infinite]"
  );
}