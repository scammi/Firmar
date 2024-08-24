const hre = require("hardhat");

async function main() {
  // Get the contract factory
  const Soul = await hre.ethers.getContractFactory("Soul");

  // Get the signer from the private key
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy the contract
  const soul = await Soul.deploy();
  await soul.deployed();

  console.log("Soul contract deployed to:", soul.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });