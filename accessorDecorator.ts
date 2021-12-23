/* If a value is returned, it is interpreted as the new descriptor */
function returnDescriptor() {
    return function (target: any, key: string, descriptor: PropertyDescriptor): any {
        return {
            value: 22,
        };
    };
}
function updateDescriptor(value: boolean) {
    return function (target: any, key: string, descriptor: PropertyDescriptor): any {
        descriptor.configurable = value;
    };
}

class House {
    @updateDescriptor(true)
    @returnDescriptor()
    get name() {
        return 'hello';
    }
}

const house = new House();
console.log(house.name);