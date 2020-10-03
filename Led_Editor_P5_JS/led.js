class Led {

  constructor(_x, _y, _d) {
    this.x = _x;
    this.y = _y;
    this.diameter = _d;
    this.state = false;
  }

  setState(state) {
    //this.state = Boolean(parseInt(state));
    this.state = state;
  }

  toggle(x, y, indx) {
    let d = dist(x, y, this.x, this.y);
    if (d < this.diameter / 2) {
      this.state = !this.state;
      //print("Toggle " + indx + " Led")
    }

  }


  show() {
    stroke(255);
    if (this.state) {
      fill(255, 0, 0); //red
    } else {
      fill(255, 255, 255, ); //white
    }
    ellipse(this.x, this.y, this.diameter);
  }



}