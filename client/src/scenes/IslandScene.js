import Phaser from 'phaser';

export default class IslandScene extends Phaser.Scene {
  constructor() {
    super({ key: 'IslandScene' });
  }

  init(data) {
    this.islandData = data;
  }

  preload() {
    // Load island assets
    this.load.image('island-bg', 'assets/island-bg.png');
    this.load.image('npc', 'assets/npc.png');
    this.load.image('boat', 'assets/boat.png');
  }

  create() {
    // Create island background
    this.add.image(400, 300, 'island-bg');

    // Create NPCs
    this.createNPCs();

    // Create UI
    this.createUI();

    // Create problem solving area
    this.createProblemArea();
  }

  createNPCs() {
    // Create NPCs based on island type
    const npcPositions = {
      'web': { x: 200, y: 200 },
      'crypto': { x: 400, y: 200 },
      'reversing': { x: 600, y: 200 }
    };

    Object.entries(npcPositions).forEach(([type, pos]) => {
      const npc = this.add.sprite(pos.x, pos.y, 'npc');
      npc.setInteractive();
      npc.type = type;

      // Add NPC name
      this.add.text(pos.x, pos.y - 40, type.charAt(0).toUpperCase() + type.slice(1), {
        fontSize: '16px',
        fill: '#ffffff'
      }).setOrigin(0.5);

      // Add click handler
      npc.on('pointerdown', () => this.interactWithNPC(type));
    });
  }

  createUI() {
    // Create top bar
    const topBar = this.add.rectangle(400, 30, 800, 60, 0x000000, 0.7);
    
    // Add buttons
    this.createButton(700, 30, 'Return to Village', () => this.returnToVillage());
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

  createProblemArea() {
    // Create problem display area
    this.problemArea = this.add.rectangle(400, 400, 600, 300, 0xffffff, 0.1);
    this.problemArea.setVisible(false);

    // Create problem content container
    this.problemContent = this.add.container(400, 400);
    this.problemContent.setVisible(false);
  }

  interactWithNPC(type) {
    // Fetch problems from server
    fetch(`/api/problems/${type}`)
      .then(response => response.json())
      .then(problems => {
        this.showProblemList(problems);
      });
  }

  showProblemList(problems) {
    // Clear previous content
    this.problemContent.removeAll();

    // Create problem list
    problems.forEach((problem, index) => {
      const y = index * 60 - (problems.length * 30);
      
      // Problem title
      const title = this.add.text(0, y, problem.title, {
        fontSize: '18px',
        fill: '#ffffff'
      }).setOrigin(0.5);

      // Difficulty indicator
      const difficulty = this.add.text(200, y, '★'.repeat(problem.difficulty), {
        fontSize: '18px',
        fill: '#ffd700'
      }).setOrigin(0.5);

      // Reward amount
      const reward = this.add.text(300, y, `${problem.reward} gold`, {
        fontSize: '18px',
        fill: '#ffd700'
      }).setOrigin(0.5);

      // Add to container
      this.problemContent.add([title, difficulty, reward]);

      // Make clickable
      const hitArea = this.add.rectangle(0, y, 500, 40, 0xffffff, 0);
      hitArea.setInteractive();
      hitArea.on('pointerdown', () => this.showProblem(problem));
      this.problemContent.add(hitArea);
    });

    // Show problem area and content
    this.problemArea.setVisible(true);
    this.problemContent.setVisible(true);
  }

  showProblem(problem) {
    // Clear previous content
    this.problemContent.removeAll();

    // Create problem view
    const title = this.add.text(0, -100, problem.title, {
      fontSize: '24px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    const description = this.add.text(0, -50, problem.hint || '', {
      fontSize: '16px',
      fill: '#ffffff',
      wordWrap: { width: 500 }
    }).setOrigin(0.5);

    // Create answer input
    const inputBox = document.createElement('input');
    inputBox.type = 'text';
    inputBox.style.position = 'absolute';
    inputBox.style.left = '150px';
    inputBox.style.top = '300px';
    inputBox.style.width = '300px';
    document.body.appendChild(inputBox);

    // Submit button
    const submitButton = this.add.rectangle(0, 50, 100, 40, 0x4a4a4a);
    const submitText = this.add.text(0, 50, 'Submit', {
      fontSize: '16px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    submitButton.setInteractive();
    submitButton.on('pointerdown', () => {
      this.submitAnswer(problem.id, inputBox.value);
      document.body.removeChild(inputBox);
    });

    // Back button
    const backButton = this.add.rectangle(-200, -100, 100, 40, 0x4a4a4a);
    const backText = this.add.text(-200, -100, 'Back', {
      fontSize: '16px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    backButton.setInteractive();
    backButton.on('pointerdown', () => {
      document.body.removeChild(inputBox);
      this.interactWithNPC(problem.type);
    });

    // Add all elements to container
    this.problemContent.add([title, description, submitButton, submitText, backButton, backText]);
  }

  submitAnswer(problemId, answer) {
    fetch('/api/submit-answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ problemId, answer })
    })
    .then(response => response.json())
    .then(result => {
      if (result.correct) {
        this.showSuccess(result.reward);
      } else {
        this.showFailure();
      }
    });
  }

  showSuccess(reward) {
    // Clear previous content
    this.problemContent.removeAll();

    // Show success message
    const successText = this.add.text(0, 0, `Correct! You earned ${reward} gold!`, {
      fontSize: '24px',
      fill: '#00ff00'
    }).setOrigin(0.5);

    // Back button
    const backButton = this.add.rectangle(0, 50, 100, 40, 0x4a4a4a);
    const backText = this.add.text(0, 50, 'Back', {
      fontSize: '16px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    backButton.setInteractive();
    backButton.on('pointerdown', () => {
      this.interactWithNPC(this.currentProblem.type);
    });

    this.problemContent.add([successText, backButton, backText]);
  }

  showFailure() {
    // Clear previous content
    this.problemContent.removeAll();

    // Show failure message
    const failureText = this.add.text(0, 0, 'Incorrect. Try again!', {
      fontSize: '24px',
      fill: '#ff0000'
    }).setOrigin(0.5);

    // Back button
    const backButton = this.add.rectangle(0, 50, 100, 40, 0x4a4a4a);
    const backText = this.add.text(0, 50, 'Back', {
      fontSize: '16px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    backButton.setInteractive();
    backButton.on('pointerdown', () => {
      this.showProblem(this.currentProblem);
    });

    this.problemContent.add([failureText, backButton, backText]);
  }

  returnToVillage() {
    this.scene.start('VillageScene');
  }
} 