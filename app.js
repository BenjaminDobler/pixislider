import * as PIXI from "pixi.js";
import img1 from "./images/img1.jpg";
import img2 from "./images/img2.jpg";
import img3 from "./images/img3.jpg";
import img4 from "./images/img4.jpg";
import img5 from "./images/img5.jpg";
import img6 from "./images/img6.jpg";
import img7 from "./images/img7.jpg";
import img8 from "./images/img1.jpg";

import disp from "./images/disp.jpg";

import fit from "math-fit";
import gsap from "gsap";

function loadImages(paths, whenLoaded) {
  const loadedImages = [];
  paths.forEach((src) => {
    const img = new Image();
    img.onload = function () {
      loadedImages.push({ src, img: this });
      if (loadedImages.length === paths.length) whenLoaded(loadedImages);
    };
    img.src = src;
  });
}

class Sketch {
  constructor() {
    this.margin = 50;
    this.scroll = 0;
    this.scrollTarget = 0;
    this.width = (window.innerWidth - 2 * this.margin) / 3;
    this.height = window.innerHeight * 0.8;
    this.thumbs = [];

    this.app = new PIXI.Application({
      backgroundColor: 0x1099bb,
      resizeTo: window,
    });
    document.body.appendChild(this.app.view);

    this.container = new PIXI.Container();
    this.app.stage.addChild(this.container);

    this.images = [img1, img2, img3, img4, img5, img6];
    this.WHOLEWIDTH = this.images.length * (this.width + this.margin);

    loadImages(this.images, (images) => {
      this.loadedImages = images;
      this.add();
      this.addDisplacement();

      this.render();
      this.scrollEvent();
    });
  }

  addDisplacement() {
    this.displacement = PIXI.Sprite.from(disp);
    const cover = fit(
      { w: 512, h: 512 },
      { w: window.innerWidth, h: window.innerHeight }
    );

    this.displacement.position.set(cover.left, cover.top);
    this.displacement.scale.set(cover.scale);
    this.app.stage.addChild(this.displacement);

    this.displacementFilter = new PIXI.filters.DisplacementFilter(
      this.displacement
    );
    this.displacementFilter.scale.x = 100;
    this.displacementFilter.scale.y = 0;

    this.container.filters = [this.displacementFilter];
  }

  add() {
    const parent = {
      w: this.width,
      h: this.height,
    };
    this.loadedImages.forEach((img, i) => {
      console.log("img ", img);
      const texture = PIXI.Texture.from(img.img);
      const sprite = new PIXI.Sprite(texture);
      const container = new PIXI.Container();
      const spriteContainer = new PIXI.Container();

      const mask = new PIXI.Sprite(PIXI.Texture.WHITE);
      mask.width = this.width;
      mask.height = this.height;

      const image = {
        w: sprite.texture.orig.width,
        h: sprite.texture.orig.height,
      };

      let cover = fit(image, parent);
      console.log(sprite.texture);
      spriteContainer.position.set(cover.left, cover.top);
      spriteContainer.scale.set(cover.scale);

      sprite.anchor.set(0.5);
      sprite.position.set(
        sprite.texture.orig.width / 2,
        sprite.texture.orig.height / 2
      );
      sprite.mask = mask;

      container.x = (this.margin + this.width) * i;
      container.y = this.height / 10;
      container.interactive = true;
      container.on("mouseover", this.mouseOver);
      container.on("mouseout", this.mouseOut);

      spriteContainer.addChild(sprite);
      container.addChild(spriteContainer);
      container.addChild(mask);
      this.container.addChild(container);

      this.thumbs.push(container);
    });
  }

  mouseOver(e) {
    const sprite = e.target.children[0].children[0];
    gsap.to(sprite.scale, {
      duration: 1,
      x: 1.1,
      y: 1.1,
    });
  }

  mouseOut(e) {
    const sprite = e.currentTarget.children[0].children[0];
    gsap.to(sprite.scale, {
      duration: 1,
      x: 1,
      y: 1,
    });
  }

  scrollEvent() {
    document.addEventListener("mousewheel", (e) => {
      this.scrollTarget = e.wheelDelta / 3;
    });
  }

  addFilter() {}

  calcPos(src, pos) {
    let temp =
      ((src + pos + this.WHOLEWIDTH + this.width + this.margin) %
        this.WHOLEWIDTH) -
      this.width -
      this.margin;
    return temp;
  }

  render() {
    this.app.ticker.add(() => {
      this.app.renderer.render(this.container);

      this.scroll += (this.scrollTarget - this.scroll) * 0.1;

      this.thumbs.forEach((thumb) => {
        thumb.position.x = this.calcPos(this.scroll, thumb.position.x);
      });

      const direction = this.scroll > 0 ? -1 : 1;
      this.displacementFilter.scale.x = 3 * Math.abs(this.scroll) * direction;
    });
  }
}

new Sketch();
