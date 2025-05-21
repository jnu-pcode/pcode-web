import Phaser from 'phaser';

export default class HouseScene extends Phaser.Scene {
  constructor() {
    super({ key: 'HouseScene' });
  }

  init(data) {
    this.houseData = data;
  }

  preload() {
    // Load house assets
    this.load.image('house-bg', 'assets/house-bg.png');
    this.load.image('furniture', 'assets/furniture.png');
  }

  create() {
    // Create house background
    this.add.image(400, 300, 'house-bg');

    // Create UI elements
    this.createUI();

    // Load and display user's HTML page
    this.loadUserPage();

    // Create collection display area
    this.createCollectionArea();
  }

  createUI() {
    // Create top bar
    const topBar = this.add.rectangle(400, 30, 800, 60, 0x000000, 0.7);
    
    // Add buttons
    this.createButton(100, 30, 'Upload Page', () => this.handlePageUpload());
    this.createButton(250, 30, 'Upload Problem', () => this.handleProblemUpload());
    this.createButton(400, 30, 'Collection', () => this.toggleCollectionMode());
    this.createButton(550, 30, 'Save', () => this.saveHouseState());
    this.createButton(700, 30, 'Exit', () => this.exitHouse());
  }

  createButton(x, y, text, callback) {
    const button = this.add.rectangle(x, y, 150, 40, 0x4a4a4a);
    const buttonText = this.add.text(x, y, text, {
      fontSize: '16px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    button.setInteractive();
    button.on('pointerdown', callback);
    button.on('pointerover', () => button.setFillStyle(0x666666));
    button.on('pointerout', () => button.setFillStyle(0x4a4a4a));
  }

  loadUserPage() {
    // Create an iframe-like container for the HTML page
    const pageContainer = this.add.rectangle(400, 350, 600, 400, 0xffffff);
    
    // Load user's HTML page via API
    fetch(`/api/user-page/${this.houseData.userId}`)
      .then(response => response.text())
      .then(html => {
        // Create a DOM element to display the HTML
        const pageElement = document.createElement('div');
        pageElement.innerHTML = html;
        pageElement.style.position = 'absolute';
        pageElement.style.left = '100px';
        pageElement.style.top = '100px';
        pageElement.style.width = '600px';
        pageElement.style.height = '400px';
        pageElement.style.overflow = 'auto';
        document.body.appendChild(pageElement);
      });
  }

  createCollectionArea() {
    // Create a grid for collection items
    this.collectionGrid = this.add.grid(400, 350, 600, 400, 50, 50, 0x000000, 0.1);
    this.collectionGrid.setVisible(false);

    // Load user's collection items
    this.loadCollectionItems();
  }

  loadCollectionItems() {
    fetch(`/api/collection/${this.houseData.userId}`)
      .then(response => response.json())
      .then(items => {
        items.forEach(item => {
          this.createCollectionItem(item);
        });
      });
  }

  createCollectionItem(item) {
    const sprite = this.add.sprite(item.x, item.y, item.type);
    sprite.setInteractive();
    this.input.setDraggable(sprite);

    sprite.on('drag', (pointer, dragX, dragY) => {
      sprite.x = dragX;
      sprite.y = dragY;
    });

    sprite.on('dragend', () => {
      // Save new position to server
      this.saveItemPosition(item.id, sprite.x, sprite.y);
    });
  }

  handlePageUpload() {
    // Implement file upload logic
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.html';
    input.onchange = (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        // Upload HTML content to server
        fetch('/api/upload-page', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: event.target.result })
        });
      };
      reader.readAsText(file);
    };
    input.click();
  }

  handleProblemUpload() {
    // Implement problem upload logic
    // Similar to page upload but with additional metadata
  }

  toggleCollectionMode() {
    this.collectionGrid.setVisible(!this.collectionGrid.visible);
  }

  saveHouseState() {
    // Save current house state to server
    const state = {
      items: Array.from(this.collectionGrid.getChildren()).map(item => ({
        id: item.id,
        x: item.x,
        y: item.y
      }))
    };

    fetch('/api/save-house', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state)
    });
  }

  exitHouse() {
    this.scene.start('VillageScene');
  }

  saveItemPosition(itemId, x, y) {
    fetch('/api/update-item-position', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, x, y })
    });
  }
} 