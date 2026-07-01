export class VideoScenario {
  private videoElement: HTMLVideoElement;
  private isPlaying = false;

  constructor() {
    this.videoElement = document.createElement('video');
    this.videoElement.style.position = 'fixed';
    this.videoElement.style.top = '0';
    this.videoElement.style.left = '0';
    this.videoElement.style.width = '100%';
    this.videoElement.style.height = '100%';
    this.videoElement.style.objectFit = 'cover';
    this.videoElement.style.zIndex = '9999';
    this.videoElement.style.display = 'none';
    document.body.appendChild(this.videoElement);
  }

  loadScenarios(scenarios: { id: string; src: string }[]) {
    // Preload videos (just store the src for now)
    // In practice, you'd use a video element and switch src on demand.
    this.scenarios = scenarios;
  }

  play(scenarioId: string) {
    const scenario = this.scenarios.find(s => s.id === scenarioId);
    if (!scenario) return;
    this.videoElement.src = scenario.src;
    this.videoElement.load();
    this.videoElement.play();
    this.videoElement.style.display = 'block';
    this.isPlaying = true;
  }

  stop() {
    this.videoElement.pause();
    this.videoElement.style.display = 'none';
    this.isPlaying = false;
  }

  update() {
    // Optionally sync with audio
  }
}
