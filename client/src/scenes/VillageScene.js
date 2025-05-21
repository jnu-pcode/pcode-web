import Phaser from 'phaser';

export default class VillageScene extends Phaser.Scene {
  constructor() {
    super({ key: 'VillageScene' });
    this.players = new Map();
    this.inPlaza = false; // 광장 진입 상태 플래그
  }

  preload() {
    this.load.image('villagebg', '/assets/village.png');
  }

  create() {
    // 화면 크기에 맞게 배경 이미지 스케일 자동 조정
    const gameWidth = this.sys.game.config.width;
    const gameHeight = this.sys.game.config.height;
    const bg = this.add.image(gameWidth / 2, gameHeight / 2, 'villagebg').setOrigin(0.5);
    const tex = this.textures.get('villagebg').getSourceImage();
    const scaleX = gameWidth / tex.width;
    const scaleY = gameHeight / tex.height;
    const scale = Math.max(scaleX, scaleY); // 꽉 채우기
    bg.setScale(scale);

    this.localPlayer = this.add.rectangle(gameWidth / 2, gameHeight / 2, 32, 32, 0xff0000);
    // 카메라 따라가기 제거
    // this.cameras.main.startFollow(this.localPlayer);

    this.cursors = this.input.keyboard.createCursorKeys();

    this.triggers = [
      { name: 'house', x: 830, y: 300, w: 60, h: 60, color: 0xccccff, label: '집' },
      { name: 'island', x: 500, y: 650, w: 60, h: 60, color: 0xffe0b2, label: '섬' },
      { name: 'plaza', x: 200, y: 120, w: 120, h: 40, color: 0xffb2b2, label: '광장' }
    ];
    this.triggers.forEach(t => {
      this.add.rectangle(t.x, t.y, t.w, t.h, t.color).setAlpha(0.5);
      this.add.text(t.x, t.y, t.label, { fontSize: '18px', fill: '#333' }).setOrigin(0.5);
    });
  }

  update() {
    if (!this.localPlayer) return;
    const speed = 4;
    if (this.cursors.left.isDown) this.localPlayer.x -= speed;
    else if (this.cursors.right.isDown) this.localPlayer.x += speed;
    if (this.cursors.up.isDown) this.localPlayer.y -= speed;
    else if (this.cursors.down.isDown) this.localPlayer.y += speed;

    // 화면 내에서만 이동하도록 제한
    const gameWidth = this.sys.game.config.width;
    const gameHeight = this.sys.game.config.height;
    this.localPlayer.x = Phaser.Math.Clamp(this.localPlayer.x, 0, gameWidth);
    this.localPlayer.y = Phaser.Math.Clamp(this.localPlayer.y, 0, gameHeight);

    let inPlazaNow = false;
    for (const t of this.triggers) {
      if (
        Math.abs(this.localPlayer.x - t.x) < t.w / 2 &&
        Math.abs(this.localPlayer.y - t.y) < t.h / 2
      ) {
        if (t.name === 'house' && window.__phaserNavigate) window.__phaserNavigate('/house');
        if (t.name === 'island' && window.__phaserNavigate) window.__phaserNavigate('/security-island');
        if (t.name === 'board' && window.__phaserNavigate) window.__phaserNavigate('/board');
        if (t.name === 'plaza') inPlazaNow = true;
      }
    }
    if (inPlazaNow && !this.inPlaza) {
      alert('광장에 도착! (추후 이벤트)');
      this.inPlaza = true;
    }
    if (!inPlazaNow) {
      this.inPlaza = false;
    }
  }
} 