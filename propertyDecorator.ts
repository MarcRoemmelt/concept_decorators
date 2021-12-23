const readOnlyFactory = () => {
    console.log('readOnlyFactory');
    return function readOnly(target: any, key: string, descriptor: PropertyDescriptor) {
        console.log('readOnly');
        descriptor.writable = false;
        return descriptor;
    }
}

class Car {
    @readOnlyFactory()
    startEngine() {
        console.log('Brrrr.');
    }
}

(function () {
    const car = new Car();
    car.startEngine();
    try {
        /* This will fail due to our decorator */
        car.startEngine = () => console.log('Wroom!');
    } catch (e) {
        /* Error: Cannot assign to read only property... */
        if ((e as Error).message.includes("Cannot assign to read only property 'startEngine' of object")) {
            console.log('Could not re-assign!');
        }
    }
    car.startEngine();
}());

/** Explanation
 *  Essentailly the decorator function is invoked before the method `startEngine` is installed
 *  into the class. It intercepts the descriptor for the method and allows to mutate it.
*/

/* Before */
let descriptor: PropertyDescriptor = {
    value: Car.prototype.startEngine,
    enumerable: false,
    configurable: true,
    writable: true,
};
/* Potentially overwrite */
descriptor = readOnlyFactory()(Car.prototype, 'startEngine', descriptor) || descriptor;
/* Install method on Car class */
Object.defineProperty(Car.prototype, 'startEngine', descriptor);


/* Decorators can be chained to add/change behaviour
 * The Factorys are executed in a top-down fashion, while the decorators are executed in a bottom-up fashoin */
const readWriteFactory = () => {
    console.log('readWriteFctory');
    return function readWrite(target: any, key: string, descriptor: PropertyDescriptor) {
        console.log('readWrite');
        descriptor.writable = true;
        return descriptor;
    }
}

class Bus {
    @readWriteFactory() // This will overwrite the read-only decorator
    @readOnlyFactory()
    startEngine() {
        console.log('Brrrr.');
    }
}

(function () {
    const bus = new Bus();
    bus.startEngine();
    /* This will fail due to our decorator */
    bus.startEngine = () => console.log('Wroom!');
    bus.startEngine();
}());

/* Examples */
/* Observe a method being called */
function observe(this: any, target: any, key: string, descriptor: PropertyDescriptor) {
    const val = descriptor.value;
    descriptor.value = (...args: any) => {
        console.log(key, ' invoked');
        val(...args);
    };
}
class Plane {
    @observe
    takeOff() {
        console.log('Woosh');
    }
}
(function () {
    const plane = new Plane();
    plane.takeOff();
}());

/* Observe a method being called */
function log(this: any, target: any, key: string, descriptor: PropertyDescriptor) {
    const val = descriptor.value;
    descriptor.value = function (...args: any) {
        const res = val.apply(this, args);
        console.log(`${key} returned ${res}`);
        return res;
    };
}

class Glider {
    battery = 0.5;

    @log
    calculateRemainingFlightHours() {
        return this.battery * 5;
    }
}
(function () {
    const glider = new Glider();
    glider.calculateRemainingFlightHours();
}());
