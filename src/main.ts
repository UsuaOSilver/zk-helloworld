import { Square } from './Square.js';
import {
  isReady,
  shutdown,
  Field,
  Mina,
  PrivateKey,
  AccountUpdate,
} from 'snarkyjs';

(async function main() {
  await isReady;

  console.log('SnarkyJS Loaded');

  const Local = Mina.LocalBlockchain();
  Mina.setActiveInstance(Local);
  const deployerAccount = Local.testAccounts[0].privateKey;

  const zkAppPrivateKey = PrivateKey.random();
  const zkAppAddress = zkAppPrivateKey.toPublicKey();

  const contract = new Square(zkAppAddress);
  const deployTxn = await Mina.transaction(deployerAccount, () => {
    AccountUpdate.fundNewAccount(deployerAccount);
    contract.init();
    contract.sign(zkAppPrivateKey);
  });
  await deployTxn.send().wait();

  const num0 = contract.num.get();
  console.log('state after init', num0.toString());

  const txn1 = await Mina.transaction(deployerAccount, () => {
    contract.update(Field(9));
    contract.sign(zkAppPrivateKey);
  });
  await txn1.send().wait();

  const num1 = contract.num.get();
  console.log('state after txn1', num1.toString());

  console.log('Shutting down');

  await shutdown();
})();
