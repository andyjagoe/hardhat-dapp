import { task } from "hardhat/config";
import fs from "fs";


task("faucet", "Sends ETH and tokens to an address")
  .addPositionalParam("receiver", "The address that will receive them")
  .setAction(async ({ receiver }, hre, runSuper) => {

    if (hre.network.name === "hardhat") {
      console.warn(
        "You are running the faucet task with Hardhat network, which" +
          "gets automatically created and destroyed every time. Use the Hardhat" +
          " option '--network localhost'"
      );
    }

    const addressesFile =
      __dirname + "/../frontend/src/contracts/contract-address.json";

    if (!fs.existsSync(addressesFile)) {
      console.error("You need to deploy your contract first");
      return;
    }

    const addressJson = fs.readFileSync(addressesFile);
    const address = JSON.parse(addressJson.toString());

    if ((await hre.ethers.provider.getCode(address.Token)) === "0x") {
      console.error("You need to deploy your contract first");
      return;
    }

    const token = await hre.ethers.getContractAt("Token", address.Token);
    const [sender] = await hre.ethers.getSigners();

    const transferAmount = hre.ethers.BigNumber.from("10").pow("18").mul("100");
    const tx = await token.transfer(receiver, transferAmount);
    await tx.wait();

    const tx2 = await sender.sendTransaction({
      to: receiver,
      value: hre.ethers.constants.WeiPerEther,
    });
    await tx2.wait();

    console.log(`Transferred 1 ETH and 100 tokens to ${receiver}`);

  });

