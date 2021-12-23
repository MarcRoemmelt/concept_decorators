import autobind from "@letsdally/autobind";

function sealed(constructor: Function) {
    Object.seal(constructor);
    Object.seal(constructor.prototype);
}

@sealed
class Report {
    type = "Report";
    title: string;

    constructor(t: string) {
        this.title = t;
    }
}

const report = new Report('Bug Report');
try {
    // @ts-ignore
    Report.prototype.print = function () {
        console.log(this.title);
    }
} catch (e) {
    if ((e as Error).message.includes('Cannot add property print, object is not extensible')) {
        console.log('Cannot add method, Class is sealed.');
    }
}

/* Example: Mixin */
function mixin<B extends Record<string | symbol, any>>(behaviour: B, sharedBehaviour: Record<string | symbol, any> = {}) {
    const instanceKeys = Reflect.ownKeys(behaviour);
    const sharedKeys = Reflect.ownKeys(sharedBehaviour);
    const typeTag = Symbol('isa');

    function _mixin<T extends any>(constructor: new () => T): new () => T & B {
        for (const property of instanceKeys) {
            Object.defineProperty(constructor.prototype, property, {
                value: behaviour[property],
                writable: Object.getOwnPropertyDescriptor(behaviour, property)?.writable,
            })
        }
        Object.defineProperty(constructor.prototype, typeTag, { value: true });
        return constructor as new () => T & B;
    }

    for (const property of sharedKeys) {
        Object.defineProperty(_mixin, property, { value: sharedBehaviour[property], enumerable: sharedBehaviour.propertyIsEnumerable(property) })
    }

    Object.defineProperty(_mixin, Symbol.hasInstance, { value: (i: any) => !!i[typeTag] });

    return _mixin;
}

const Consumer = mixin({
    gear: 1,
    shiftGear(gear: number) {
        this.gear = gear;
    },
});

@Consumer
class Train {
    name = 'train';
}

const train = new Train();
/* NOTE: Decorators do not extend the type of a class */
// train.shiftGear(2); // This is a compile-time error

// @ts-ignore
train.shiftGear(2); // this will work

function bind<T extends new (...args: any[]) => any>(constructor: T) {
    return class extends constructor {
        constructor(...args: any[]) {
            super(args);
            autobind(this);
        }
    }
}

@bind
class BoundTable {
    legs = 0;

    build() {
        console.log('bound: ', this);
    }
}
class UnboundTable {
    legs = 0;

    build() {
        console.log('unbound: ', this);
    }
}

const boundTable = new BoundTable();
const unboundTable = new UnboundTable();

class Chair {
    legs = 2;
    bound: () => any;
    unbound: () => any;
    
    constructor(bound: () => any, unbound: () => void) {
        this.bound = bound;
        this.unbound = unbound;
    }
    build() {
        this.bound();
        this.unbound();
    }
}
const chair = new Chair(boundTable.build, unboundTable.build);
chair.build();
