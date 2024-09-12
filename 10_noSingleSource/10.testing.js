// race conditions - unpredictable order of operations; different order of events screws up the state/data
// the correctness of the program (the satisfaction of its specs and preservation of its invariants) depends on the relative timing of events in concurrent computations A and B

// let balance = 100;

// async function getBalance() {
//   return balance;
// }
// async function setBalance(newBalance) {
//   balance = newBalance;
// }

// async function deduct(amt) {
//   const balance = await getBalance();
//   console.log(balance);
//   if (balance >= amt) return await setBalance(balance - amt);
// }
// // function getBalance() {
// //   return balance;
// // }
// // function setBalance(newBalance) {
// //   balance = newBalance;
// // }

// // function deduct(amt) {
// //   const balance = getBalance();
// //   console.log(balance);
// //   if (balance >= amt) return setBalance(balance - amt);
// // }

// (async () => {
//   await deduct(10);
//   await deduct(20);
//   console.log(balance);
// })();

// async function timeout(milliseconds) {
//   return new Promise((resolve) => {
//     setTimeout(resolve, milliseconds);
//   });
// }

// async function clock(milliseconds) {
//   while (true) {
//     await timeout(milliseconds);
//     console.log("tick");
//   }
// }

// (() => {
//   clock(1000);
// })();
// console.log("from top");
