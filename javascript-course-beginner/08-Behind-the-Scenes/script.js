const jessica = {
  firstName: 'Jessica ',
  lastName: 'Williams',
  age: 27,
  friends: ['Michael', 'Steven', 'Olivia'],
};
const jessicaMarried = structuredClone(jessica);
jessicaMarried.lastName = 'Davis';

console.log('Before marriage:', jessica);
console.log('After marriage:', jessicaMarried);
