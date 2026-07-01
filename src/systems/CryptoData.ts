export class CryptoData {
  private interval: any;

  startTicker(callback: (price: number) => void) {
    // Mock price – replace with real API call
    this.interval = setInterval(() => {
      const price = 30000 + Math.random() * 5000;
      callback(price);
    }, 3000);
  }

  stop() {
    clearInterval(this.interval);
  }
}
