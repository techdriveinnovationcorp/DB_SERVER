const EventEmitter = require('events');

class ListenerService {
  constructor() {
    this.listeners = {};
  }

  notifyListeners(name, data) {
    if (this.listeners[name]) {
      this.listeners[name].emit('data', data);
    } else {
      console.warn(`No listeners found for: ${name}`);
    }
  }

  subscribeToListener(name, callback) {
    if (!this.listeners[name]) {
      this.listeners[name] = new EventEmitter();
    }
    
    // Attach event listener
    this.listeners[name].on('data', callback);    
    return {
      unsubscribe: () => {
        this.listeners[name].off('data', callback);
      }
    };
  }
}

module.exports = new ListenerService();
