from brownie import SolidityStorage, VyperStorage, Token, Voter, accounts, network


def main():
    # requires brownie account to have been created
    print(network.show_active())
    if network.show_active()=='development':
        # add these accounts to metamask by importing private key
        owner = accounts[0]
        SolidityStorage.deploy({'from':accounts[0]})
        VyperStorage.deploy({'from':accounts[0]})

    elif network.show_active() == 'kovan':
        # add these accounts to metamask by importing private key
        owner = accounts.load("main")
        SolidityStorage.deploy({'from':owner})
        VyperStorage.deploy({'from':owner})

    elif network.show_active()=='mainnet-fork':
        deployment_account = accounts.load('deployment_account')
        vlad_account = accounts.load('Vlad_account')

        accounts[0].transfer(deployment_account, '1 ether')
        accounts[0].transfer(vlad_account, '1 ether')

        owner = deployment_account

        t = Token.deploy('ICE Token', 'ICE', {'from':owner})
        t.transfer(vlad_account, 25, {'from': deployment_account})
        t.transfer(accounts[0], 35, {'from': deployment_account})
        v = Voter.deploy(t, {'from':owner})

        v.propose("My Proposal".encode('utf-8').hex(), {'from': owner})
        v.propose("My Proposal2".encode('utf-8').hex(), {'from': owner})
        v.getProposalsF(deployment_account)