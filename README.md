# DAO

## Requirements
- python3
- eth-brownie
## Pre-usage
- install brownie
- [create](https://eth-brownie.readthedocs.io/en/stable/network-management.html?highlight=network#using-a-forked-development-network) fork mainnet network in brownie
## Usage
- For test use
```
brownie test -s --disable-warnings --network mainnet-fork
```
## Output
- For test
```
MBP-Vlad-2:react vlad$ brownie test -s --disable-warnings --network mainnet-fork
Brownie v1.19.2 - Python development framework for Ethereum

Compiling contracts...
  Solc version: 0.8.17
  Optimizer: Enabled  Runs: 200
  EVM Version: Istanbul
Generating build data...
 - OpenZeppelin/openzeppelin-contracts@4.8.0/ERC20
 - OpenZeppelin/openzeppelin-contracts@4.8.0/IERC20
 - OpenZeppelin/openzeppelin-contracts@4.8.0/IERC20Metadata
 - OpenZeppelin/openzeppelin-contracts@4.8.0/Context
 - Voter

================================= test session starts ==================================
platform darwin -- Python 3.8.9, pytest-6.2.5, py-1.11.0, pluggy-1.0.0 -- /Library/Developer/CommandLineTools/usr/bin/python3
cachedir: .pytest_cache
hypothesis profile 'brownie-verbose' -> verbosity=2, deadline=None, max_examples=50, stateful_step_count=10, report_multiple_bugs=False, database=DirectoryBasedExampleDatabase(PosixPath('/Users/vlad/.brownie/hypothesis'))
rootdir: /Users/vlad/GitHub/alchemy-ethereum-api/blockchain-project/react
plugins: eth-brownie-1.19.2, anyio-3.6.1, forked-1.4.0, web3-5.31.1, xdist-1.34.0, hypothesis-6.27.3
collected 16 items                                                                     

Launching 'ganache-cli --accounts 10 --hardfork istanbul --fork https://eth-mainnet.alchemyapi.io/v2/5HKq7S1lnvTuNZGqkfocRIcd7BIcsGZ7 --gasLimit 12000000 --mnemonic brownie --port 8545 --chainId 1'...

tests/test_solidity_storage.py::test_solidity_storage_deploy PASSED
tests/test_solidity_storage.py::test_solidity_storage_set PASSED
tests/test_voter.py::test_transfer PASSED
tests/test_voter.py::test_empty_proposal PASSED
tests/test_voter.py::test_vote_for_undefined_proposal RUNNING
Transaction sent: 0x855f6230449ead70f901148dfe1188859b774ff1f5fedd97b33c9b15b8bd0f52
tests/test_voter.py::test_vote_for_undefined_proposal PASSED
tests/test_voter.py::test_vote_for_default_proposal RUNNING
Transaction sent: 0xeb97f7600874aa19dab393261033ec6e39cc483d0119fdde8d1646b59f2d5c28
tests/test_voter.py::test_vote_for_default_proposal PASSED
tests/test_voter.py::test_propose PASSED
tests/test_voter.py::test_proposes PASSED
tests/test_voter.py::test_much_propose PASSED
tests/test_voter.py::test_propose_after_vote PASSED
tests/test_voter.py::test_vote_for_amount PASSED
tests/test_voter.py::test_vote_already_gained RUNNING
Transaction sent: 0x50c3596d64810bbd183cc50fb71360e73da0792fc98637edeaee5e8e262f5985
tests/test_voter.py::test_vote_already_gained PASSED
tests/test_voter.py::test_vote_too_much_amount PASSED
tests/test_voter.py::test_vote_and_transfer PASSED
tests/test_vyper_storage.py::test_vyper_storage_deploy PASSED
tests/test_vyper_storage.py::test_vyper_storage_set PASSED

================================= 16 passed in 31.47s ==================================
Terminating local RPC client...

```
