const rateLimit = require("express-rate-limit");

class ApiLimiter {
    #store;
    #rate;

    middleware;

    get maxRate() { return this.rate; };

    set maxRate(rate) {
        this.rate = rate;
        this.store.resetAll();
    };

    constructor (rate = 100) {
        this.store = new rateLimit.MemoryStore();
        this.maxRate = rate;

        this.middleware = rateLimit({
            windowMs: 10 * 60 * 1000, // 15 minutes
            max: () => this.maxRate,
            store: this.store
        });
    }
}

module.exports = ApiLimiter;